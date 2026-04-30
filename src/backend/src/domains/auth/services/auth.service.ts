import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { StringValue } from 'ms';
import { DataSource, Repository } from 'typeorm';
import { PasswordService } from 'src/common/security/password.service';
import { MailService } from 'src/mail/mail.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dto/register.dto';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { LoginResponseDto } from '../dto/login-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokensRepository: Repository<PasswordResetToken>,
  ) {}

  async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.usersService.findActiveUserForAuth(
      usernameOrEmail.trim(),
    );

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return this.usersService.toResponse(user);
  }

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    return this.usersService.register(registerDto);
  }

  async generateTokens(user: UserResponseDto) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      type: 'refresh',
    };

    const expiresIn =
      this.configService.getOrThrow<StringValue>('auth.jwtExpiresIn');
    const jwtSecret = this.configService.getOrThrow<string>('auth.jwtSecret');
    const jwtRefreshSecret = this.configService.getOrThrow<string>(
      'auth.jwtRefreshSecret',
    );
    const jwtRefreshExpiresIn = this.configService.getOrThrow<StringValue>(
      'auth.jwtRefreshExpiresIn',
    );

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: jwtSecret,
          expiresIn,
        }),
        this.jwtService.signAsync(refreshPayload, {
          secret: jwtRefreshSecret,
          expiresIn: jwtRefreshExpiresIn,
        }),
      ]);
      return { accessToken, refreshToken, expiresIn, tokenType: 'Bearer' };
    } catch (e) {
      this.logger.error(
        'Failed to sign token!',
        e instanceof Error ? e.stack : String(e),
      );
      throw new InternalServerErrorException('Failed to sign token!');
    }
  }

  async login(user: UserResponseDto): Promise<LoginResponseDto> {
    return this.buildLoginResponse(user);
  }

  private async buildLoginResponse(
    user: UserResponseDto,
  ): Promise<LoginResponseDto> {
    const [token, currentUser] = await Promise.all([
      this.generateTokens(user),
      this.usersService.findCurrentUserProfile(user.id),
    ]);

    return {
      ...token,
      user,
      availableMenus: currentUser.availableMenus,
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      {
        secret: this.configService.getOrThrow<string>('auth.jwtRefreshSecret'),
      },
    );

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.usersService.findActiveUserById(payload.sub);
    return this.buildLoginResponse(this.usersService.toResponse(user));
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.trim();
    const user = await this.usersService.findActiveUserByEmail(normalizedEmail);

    if (!user) {
      return {
        message:
          'If the email is registered, a password reset link will be sent.',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.passwordResetTokensRepository.update(
        { userId: user.id, used: false },
        { used: true },
      );
      const rawToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(
        Date.now() +
          this.configService.getOrThrow<number>(
            'passwordReset.tokenExpiresInMinutes',
          ) *
            60 *
            1000,
      );

      const passwordResetToken = this.passwordResetTokensRepository.create({
        token: rawToken,
        userId: user.id,
        expiresAt,
        used: false,
      });

      await this.passwordResetTokensRepository.save(passwordResetToken);
      const resetUrl = this.buildResetUrl(rawToken);
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.fullname,
        resetUrl,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Failed to send an email');
    } finally {
      await queryRunner.release();
    }

    return {
      message:
        'If the email is registered, a password reset link will be sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const passwordResetToken = await this.passwordResetTokensRepository.findOne(
      {
        where: {
          token: token,
          used: false,
        },
      },
    );

    if (!passwordResetToken || passwordResetToken.expiresAt <= new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.usersService.updatePassword(
        passwordResetToken.userId,
        newPassword,
      );
      await this.passwordResetTokensRepository.update(
        { userId: passwordResetToken.userId, used: false },
        { used: true },
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
      throw new InternalServerErrorException('Failed to reset password');
    } finally {
      await queryRunner.release();
    }

    return {
      message: 'Password has been reset successfully.',
    };
  }

  private buildResetUrl(token: string): string {
    const frontendUrl = this.configService
      .getOrThrow<string>('passwordReset.frontendUrl')
      .replace(/\/+$/, '');
    const searchParams = new URLSearchParams({ token });

    return `${frontendUrl}/reset-password?${searchParams.toString()}`;
  }
}
