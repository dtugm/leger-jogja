import * as crypto from 'crypto';
import {
  BadRequestException,
  HttpException,
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
import { User } from 'src/domains/users/entities/user.entity';

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
    const genericReponse = 'If the email is registered, a password reset link will be sent.'

    const normalizedEmail = email.trim();
    const user = await this.usersService.findActiveUserByEmail(normalizedEmail);

    if (!user) {
      return {
        message: genericReponse
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(
      Date.now() +
        this.configService.getOrThrow<number>(
          'passwordReset.tokenExpiresInMinutes',
        ) *
          60 *
          1000,
    );

    await this.dataSource.transaction(async (manager) => {
      const tokenRepo = manager.getRepository(PasswordResetToken);

      await tokenRepo.update(
        { userId: user.id, used: false },
        { used: true }
      );

      await tokenRepo.save(
        tokenRepo.create({
          token: tokenHash,
          userId: user.id,
          expiresAt,
          used: false,
        })
      );
    });

    try { 
      const resetUrl = this.buildResetUrl(rawToken);
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.fullname,
        resetUrl,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
    } 

    return genericReponse;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const hashPassword = await this.passwordService.hash(newPassword);

    await this.dataSource.transaction(async (manager) => {
      // update token to used and get userId in the same query to prevent race condition
      const result = await manager
        .createQueryBuilder()
        .update(PasswordResetToken)
        .set({ used: true })
        .where(
          'token = :token AND used = false AND expiresAt > :now',
          { token: tokenHash, now: new Date() }
        )
        .returning('userId')
        .execute();
      
        if (result.affected !== 1) {
          throw new BadRequestException('Invalid or expired password reset token');
        }

        const userId = result.raw[0].userId;

        // update user password
        await manager.update(
          User,
          { id: userId },
          { password: hashPassword }
        );
    }).catch((error) => {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset password');
    });

    return {
      message: 'Password has been reset successfully.',
    };
  }

  private buildResetUrl(token: string): string {
    const frontendUrl = this.configService
      .getOrThrow<string>('passwordReset.frontendUrl')
      .replace(/\/+$/, '');
    const searchParams = new URLSearchParams({ token });

    return `${frontendUrl}/auth/login/new-password?${searchParams.toString()}`;
  }
}
