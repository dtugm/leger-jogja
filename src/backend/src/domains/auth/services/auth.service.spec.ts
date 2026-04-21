import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from '../../../common/security/password.service';
import { UserRole } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findActiveUserForAuth: jest.fn(),
    toResponse: jest.fn(),
    findOne: jest.fn(),
    register: jest.fn(),
  };
  const passwordService = {
    compare: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'auth.jwtExpiresIn') {
        return '1h';
      }
      return undefined;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'auth.jwtExpiresIn') {
        return '1h';
      }
      throw new Error(`Unexpected config key: ${key}`);
    }),
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

  it('creates a login response with token metadata', async () => {
    const user = {
      id: 'user-id',
      email: 'admin@example.com',
      username: 'admin',
      fullname: 'Admin User',
      role: UserRole.SUPER_ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(service.login(user)).resolves.toEqual({
      accessToken: 'signed-token',
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
});
