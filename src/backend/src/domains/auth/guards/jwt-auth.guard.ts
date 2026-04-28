import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override getAuthenticateOptions() {
    return { session: false };
  }

  override handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info?: { name?: string; message?: string },
    context?: ExecutionContext,
  ): TUser {
    void context;

    if (user) {
      return user;
    }

    if (err instanceof UnauthorizedException) {
      throw err;
    }

    // Mapping error dari passport-jwt
    const errorMessages: Record<string, string> = {
      'TokenExpiredError': 'Access token expired',
      'JsonWebTokenError': 'Invalid access token',
    };

    if (info?.name && errorMessages[info.name]) {
      throw new UnauthorizedException(errorMessages[info.name]);
    }

    if (info?.message === 'No auth token') {
      throw new UnauthorizedException('No access token provided');
    }

    throw new UnauthorizedException('Authentication required');
  }
}
