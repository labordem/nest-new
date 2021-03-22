import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request, Response } from 'express';
import { TimeoutError } from 'rxjs';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }
    if (exception instanceof TimeoutError) {
      status = HttpStatus.REQUEST_TIMEOUT;
      message = 'Request timeout';
    }
    if (
      exception instanceof Error &&
      exception.name === ('JsonWebTokenError' || 'TokenExpiredError')
    ) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token';
    }

    response.status(status).json({
      status,
      message,
      thrownAt: new Date().toISOString(),
      path: request.url,
    });
  }
}
