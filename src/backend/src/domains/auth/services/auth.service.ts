import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from '../../../common/security/password.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    const expiresIn = this.configService.get('auth.jwtExpiresIn');
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('auth.jwtSecret'),
        expiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get('auth.jwtRefreshSecret'),
        expiresIn: this.configService.get('auth.jwtRefreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken, expiresIn, tokenType: 'Bearer', };
  }

  async login(user: UserResponseDto) {
    const token = await this.generateTokens(user);

    return {
      ...token,
      user,
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('auth.jwtRefreshSecret'),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    // find user
    const user = await this.usersService.findActiveUserById(payload.sub)
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = await this.generateTokens(user);
    return {
      ...token,
      user: this.usersService.toResponse(user),
    }
  }
}
