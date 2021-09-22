import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { TimeoutError } from 'rxjs';
import { QueryFailedError } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

import { ExceptionError } from '../enums/exception-error.enum';

export interface ErrorResponse {
  status: HttpStatus;
  message: string;
  error?: ExceptionError;
  validations?: ValidationError[];
  path?: string;
  thrownAt?: string;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Server error';
    let validations: ValidationError[] | undefined;
    let error: ExceptionError | undefined;

    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      validations = this.getValidationsFromException(exception);
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Query Failed Error';
    } else if (exception instanceof TimeoutError) {
      status = HttpStatus.REQUEST_TIMEOUT;
      message = 'Request Timeout Error';
    } else if (
      exception instanceof Error &&
      exception.name === ('JsonWebTokenError' || 'TokenExpiredError')
    ) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Unauthorized Exception';
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    if (exception instanceof HttpException) {
      error = this.getErrorFromException(exception);
    }

    let errorResponse: ErrorResponse = { status, message };
    if (validations?.length) {
      errorResponse.validations = validations;
    }
    if (error) {
      errorResponse.error = error;
    }
    errorResponse = {
      ...errorResponse,
      path: request.url,
      thrownAt: new Date().toISOString(),
    };

    Logger.debug(errorResponse);
    response.status(status).json(errorResponse);
  }

  /** Get error enum value from normal exception. */
  private getErrorFromException(
    exception: HttpException,
  ): ExceptionError | undefined {
    const fromException = exception.getResponse() as {
      error: ExceptionError;
    };
    const error = fromException?.error;
    const isAKnownError = Object.values(ExceptionError)?.includes(error);

    return isAKnownError ? error : undefined;
  }

  /** Get validation informations from class-validator response. */
  private getValidationsFromException(
    exception: BadRequestException,
  ): ValidationError[] | undefined {
    const fromClassValidator = exception.getResponse() as {
      message: ValidationError[];
    };
    const validations = fromClassValidator?.message;

    return validations;
  }
}
