import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TimeoutError } from 'rxjs';
import { QueryFailedError } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    Logger.debug(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid inputs';
    } else if (exception instanceof TimeoutError) {
      status = HttpStatus.REQUEST_TIMEOUT;
      message = 'Request timeout';
    } else if (
      exception instanceof Error &&
      exception.name === ('JsonWebTokenError' || 'TokenExpiredError')
    ) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token';
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
    }

    response.status(status).json({
      status,
      message,
      thrownAt: new Date().toISOString(),
      path: request.url,
    });
  }
}
