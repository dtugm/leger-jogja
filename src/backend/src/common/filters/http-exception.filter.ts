import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from 'express';


@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse: any = exception.getResponse?.();

    let validationErrors = null;
    let message = exception.message;

    if (typeof exceptionResponse === 'object') {
      if (Array.isArray(exceptionResponse.message)) {
        message = 'Validation failed';
        validationErrors = exceptionResponse.message;
      } else {
        message = exceptionResponse.message || exception.message;
      }
    }

    response.status(status).json({
      status: 'error',
      code: status,
      message: message,
      errors: validationErrors, 
    });
  } 
}