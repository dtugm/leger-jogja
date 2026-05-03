import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PasswordService } from '../../../common/security/password.service';
import { MailService } from '../../../mail/mail.service';
import { UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { AuthService } from './auth.service';

type PasswordResetTokenDraft = Pick<
  PasswordResetToken,
  'token' | 'userId' | 'expiresAt' | 'used'
>;
type PasswordResetTokenRecord = PasswordResetTokenDraft &
  Pick<PasswordResetToken, 'id'>;

describe('AuthService', () => {
  let service: AuthService;
  const flushPasswordResetEmailJob = async () => {
    await new Promise<void>((resolve) => setImmediate(resolve));
    await Promise.resolve();
    await Promise.resolve();
  };
  const usersService = {
    findActiveUserForAuth: jest.fn(),
    findActiveUserByEmail: jest.fn(),
    findActiveUserById: jest.fn(),
    toResponse: jest.fn(),
    register: jest.fn(),
    updatePassword: jest.fn(),
  };
  const passwordService = {
    compare: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };
  const configService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'auth.jwtExpiresIn':
          return '1h';
        case 'auth.jwtSecret':
          return 'jwt-secret';
        case 'auth.jwtRefreshSecret':
          return 'jwt-refresh-secret';
        case 'auth.jwtRefreshExpiresIn':
          return '7d';
        default:
          return undefined;
      }
    }),
    getOrThrow: jest.fn((key: string) => {
      switch (key) {
        case 'auth.jwtExpiresIn':
          return '1h';
        case 'auth.jwtSecret':
          return 'jwt-secret';
        case 'auth.jwtRefreshSecret':
          return 'jwt-refresh-secret';
        case 'auth.jwtRefreshExpiresIn':
          return '7d';
        case 'passwordReset.tokenExpiresInMinutes':
          return 60;
        case 'passwordReset.frontendUrl':
          return 'http://localhost:3001';
        default:
          throw new Error(`Unexpected config key: ${key}`);
      }
    }),
  };
  const passwordResetTokensRepository = {
    create: jest.fn<PasswordResetTokenDraft, [PasswordResetTokenDraft]>(),
    save: jest.fn<
      Promise<PasswordResetTokenRecord>,
      [PasswordResetTokenDraft]
    >(),
    update: jest.fn<Promise<void>, [Record<string, unknown>, object]>(),
    findOne: jest.fn<Promise<PasswordResetTokenRecord | null>, [object]>(),
  };
  const mailService = {
    sendPasswordResetEmail: jest.fn<Promise<void>, [string, string, string]>(),
  };
  const queryRunner = {
    connect: jest.fn<Promise<void>, []>(),
    startTransaction: jest.fn<Promise<void>, []>(),
    commitTransaction: jest.fn<Promise<void>, []>(),
    rollbackTransaction: jest.fn<Promise<void>, []>(),
    release: jest.fn<Promise<void>, []>(),
  };
  const dataSource = {
    createQueryRunner: jest.fn(() => queryRunner),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PasswordService, useValue: passwordService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: passwordResetTokensRepository,
        },
        { provide: MailService, useValue: mailService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns null when credentials are invalid', async () => {
    usersService.findActiveUserForAuth.mockResolvedValue({
      password: 'hashed-password',
    });
    passwordService.compare.mockResolvedValue(false);

    await expect(
      service.validateUser('admin', 'wrong-password'),
    ).resolves.toBeNull();
  });

  it('returns a sanitized user when credentials are valid', async () => {
    const authUser = {
      id: 'user-id',
      email: 'admin@example.com',
      username: 'admin',
      fullname: 'Admin User',
      role: UserRole.SUPER_ADMIN,
      password: 'hashed-password',
    };
    const responseUser = {
      id: 'user-id',
      email: 'admin@example.com',
      username: 'admin',
      fullname: 'Admin User',
      role: UserRole.SUPER_ADMIN,
    };
    usersService.findActiveUserForAuth.mockResolvedValue(authUser);
    passwordService.compare.mockResolvedValue(true);
    usersService.toResponse.mockReturnValue(responseUser);

    await expect(service.validateUser('admin', 'password123')).resolves.toEqual(
      responseUser,
    );
  });

  it('creates a login response with access and refresh token metadata', async () => {
    const user = {
      id: 'user-id',
      email: 'admin@example.com',
      username: 'admin',
      fullname: 'Admin User',
      role: UserRole.SUPER_ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(service.login(user)).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: '1h',
      user,
    });
  });

  it('registers a public user account', async () => {
    const registeredUser = {
      id: 'user-id',
      email: 'new.user@example.com',
      username: 'newuser',
      fullname: 'New User',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    usersService.register.mockResolvedValue(registeredUser);

    await expect(
      service.register({
        email: 'new.user@example.com',
        username: 'newuser',
        fullname: 'New User',
        password: 'password123',
      }),
    ).resolves.toEqual(registeredUser);
  });

  it('returns generic success when forgot password email is unknown', async () => {
    usersService.findActiveUserByEmail.mockResolvedValue(null);

    await expect(
      service.requestPasswordReset('missing@example.com'),
    ).resolves.toEqual({
      message:
        'If the email is registered, a password reset link will be sent.',
    });

    expect(passwordResetTokensRepository.create).not.toHaveBeenCalled();
    expect(passwordResetTokensRepository.save).not.toHaveBeenCalled();
    expect(passwordResetTokensRepository.update).not.toHaveBeenCalled();
    expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('creates and emails a raw reset token for a known user', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      fullname: 'Known User',
    };
    usersService.findActiveUserByEmail.mockResolvedValue(user);
    passwordResetTokensRepository.create.mockImplementation((input) => input);
    passwordResetTokensRepository.save.mockImplementation((input) =>
      Promise.resolve({
        id: 42,
        ...input,
      }),
    );

    await expect(
      service.requestPasswordReset('user@example.com'),
    ).resolves.toEqual({
      message:
        'If the email is registered, a password reset link will be sent.',
    });

    expect(passwordResetTokensRepository.update).toHaveBeenCalledWith(
      { userId: 'user-id', used: false },
      { used: true },
    );
    await flushPasswordResetEmailJob();

    const savedToken =
      passwordResetTokensRepository.create.mock.calls[0][0].token;
    const resetUrl = mailService.sendPasswordResetEmail.mock.calls[0][2];
    const rawToken = new URL(resetUrl).searchParams.get('token');

    expect(savedToken).toHaveLength(64);
    expect(rawToken).toBeTruthy();
    expect(savedToken).toBe(rawToken);
    expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      'Known User',
      expect.stringContaining('http://localhost:3001/reset-password?token='),
    );
  });

  it('returns success and keeps the fresh token usable if email delivery fails', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      fullname: 'Known User',
    };
    usersService.findActiveUserByEmail.mockResolvedValue(user);
    passwordResetTokensRepository.create.mockImplementation((input) => input);
    passwordResetTokensRepository.save.mockResolvedValue({
      id: 99,
      token: 'hashed-token',
      userId: 'user-id',
      expiresAt: new Date(Date.now() + 60000),
      used: false,
    });
    mailService.sendPasswordResetEmail.mockRejectedValue(
      new Error('smtp unavailable'),
    );

    await expect(
      service.requestPasswordReset('user@example.com'),
    ).resolves.toEqual({
      message:
        'If the email is registered, a password reset link will be sent.',
    });
    await flushPasswordResetEmailJob();

    expect(passwordResetTokensRepository.update).toHaveBeenCalledTimes(1);
    expect(passwordResetTokensRepository.update).toHaveBeenCalledWith(
      { userId: 'user-id', used: false },
      { used: true },
    );
  });

  it('resets password and invalidates unused tokens for a valid token', async () => {
    const rawToken = 'plain-reset-token';
    passwordResetTokensRepository.findOne.mockResolvedValue({
      id: 15,
      token: rawToken,
      userId: 'user-id',
      used: false,
      expiresAt: new Date(Date.now() + 60000),
    });

    await expect(
      service.resetPassword(rawToken, 'new-password-123'),
    ).resolves.toEqual({
      message: 'Password has been reset successfully.',
    });

    expect(usersService.updatePassword).toHaveBeenCalledWith(
      'user-id',
      'new-password-123',
    );
    expect(passwordResetTokensRepository.update).toHaveBeenCalledWith(
      { userId: 'user-id', used: false },
      { used: true },
    );
    expect(passwordResetTokensRepository.findOne).toHaveBeenCalledWith({
      where: {
        token: rawToken,
        used: false,
      },
    });
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('normalizes reset tokens copied from full reset URLs', async () => {
    const rawToken = 'plain-reset-token';
    passwordResetTokensRepository.findOne.mockResolvedValue({
      id: 15,
      token: rawToken,
      userId: 'user-id',
      used: false,
      expiresAt: new Date(Date.now() + 60000),
    });

    await expect(
      service.resetPassword(
        ` http://localhost:3001/reset-password?token=${rawToken} `,
        'new-password-123',
      ),
    ).resolves.toEqual({
      message: 'Password has been reset successfully.',
    });

    expect(passwordResetTokensRepository.findOne).toHaveBeenCalledWith({
      where: {
        token: rawToken,
        used: false,
      },
    });
  });

  it('normalizes reset tokens copied from query strings', async () => {
    const rawToken = 'plain-reset-token';
    passwordResetTokensRepository.findOne.mockResolvedValue({
      id: 15,
      token: rawToken,
      userId: 'user-id',
      used: false,
      expiresAt: new Date(Date.now() + 60000),
    });

    await expect(
      service.resetPassword(`?token=${rawToken}`, 'new-password-123'),
    ).resolves.toEqual({
      message: 'Password has been reset successfully.',
    });

    expect(passwordResetTokensRepository.findOne).toHaveBeenCalledWith({
      where: {
        token: rawToken,
        used: false,
      },
    });
  });

  it('rejects an expired reset token', async () => {
    passwordResetTokensRepository.findOne.mockResolvedValue({
      id: 15,
      token: 'hashed-token',
      userId: 'user-id',
      used: false,
      expiresAt: new Date(Date.now() - 60000),
    });

    await expect(
      service.resetPassword('expired-token', 'new-password-123'),
    ).rejects.toThrow('Invalid or expired password reset token');

    expect(usersService.updatePassword).not.toHaveBeenCalled();
  });
});
