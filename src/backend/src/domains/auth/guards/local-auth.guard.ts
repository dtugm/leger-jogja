import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  override getAuthenticateOptions() {
    return { session: false };
  }

  override handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info?: unknown,
    context?: ExecutionContext,
  ): TUser {
    void info;
    void context;

    if (user) {
      return user;
    }

    if (err instanceof UnauthorizedException) {
      throw err;
    }

    throw new UnauthorizedException('Invalid username/email or password');
  }
}
