import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        // Sanitize the response data
        const sanitizedData = instanceToPlain(response);
        const isPaginated = sanitizedData && sanitizedData.result;

        if (isPaginated) {
          return {
            status: 'success',
            message: sanitizedData?.message || 'Data retrieved successfully',
            data: sanitizedData.result,
            pagination: sanitizedData.pagination || null,
            metadata: sanitizedData.metadata || null,
          };
        }

        let data: any;
        let message = 'Request processed successfully';

        if (Array.isArray(sanitizedData)) {
          data = sanitizedData;
        } else {
          const { message: extractedMessage, ...dataWithoutMessage } = sanitizedData || {};
          message = extractedMessage || message;
          data = dataWithoutMessage;
        }

        const finalResponse: any = {
          status: 'success',
          message: message,
        };

        // Ensure data is included even if it's an empty array, but exclude empty objects
        if (data !== undefined && data !== null &&
          (Array.isArray(data) || Object.keys(data).length > 0)) {
          finalResponse.data = data;
        }

        return finalResponse;
      }),
    );
  }
}