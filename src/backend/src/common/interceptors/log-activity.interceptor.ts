import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { SKIP_LOG_ACTIVITY_KEY } from '../decorators/skip-log-activity.decorator';
import { LogActivityService } from 'src/domains/log-activity/services/log-activity.service';

const SKIPPED_PREFIXES = ['/health', '/log-activity'];
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'refreshToken', 'accessToken', 'newPassword'];

@Injectable()
export class LogActivityInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logActivityService: LogActivityService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_LOG_ACTIVITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) return next.handle();

    const req = context.switchToHttp().getRequest();
    const path: string = req.path || req.originalUrl?.split('?')[0] || '';

    if (SKIPPED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next.handle();
    }

    const start = Date.now();
    const { action, resource, resourceId } = this.deriveLogMeta(req);

    const saveLog = (statusCode: number) => {
      this.logActivityService.log({
        userId: req.user?.id,
        action,
        resource, 
        resourceId,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode,
        responseTime: Date.now() - start,
        ipAddress: this.getIp(req),
        userAgent: req.headers['user-agent'],
        payload: this.sanitizePayload(req.body),
      });
    };
    
    const successCode =
      this.reflector.get<number>(HTTP_CODE_METADATA, context.getHandler()) ??
      (req.method === 'POST' ? 201 : 200);

    return next.handle().pipe(
      tap(() => saveLog(successCode)),
      catchError((err) => {
        saveLog(err?.status ?? err?.statusCode ?? 500);
        return throwError(() => err);
      }),
    );
  }

  private deriveLogMeta(req: any): { action: string; resource: string; resourceId?: string } {
    const segments = (req.path || '').split('/').filter(Boolean);
    const resource = segments[0] || 'unknown';
    const subPath = segments[1];

    let action: string;
    const method = (req.method as string).toUpperCase();

    if (resource === 'auth' && subPath === 'login') {
      action = 'login';
    } else {
      const map: Record<string, string> = {
        GET: 'read',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete',
      };
      action = map[method] ?? method.toLowerCase();
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const resourceId = segments.find((s, i) => i > 0 && uuidRegex.test(s));

    return { action, resource, resourceId };
  }

  private sanitizePayload(body: any): Record<string, any> | null {
    if (!body || typeof body !== 'object') return null;
    const sanitized = { ...body };
    for (const field of SENSITIVE_FIELDS) {
      if (field in sanitized) sanitized[field] = '[REDACTED]';
    }
    return sanitized;
  }

  private getIp(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ??
      req.ip ??
      null
    );
  }
}
