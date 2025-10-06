import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  responseAlreadyCreated,
  responseConflict,
  responseForbidden,
  responseInternalServerError,
  responseNotFound,
} from 'src/shared/handler/http.handler';
import {
  AlreadyCreatedError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/shared/handler/errors';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const path = request.url;
    const description = `${request.method} ${path}`;

    console.error(' Error capturado:', exception);

  
    if (exception instanceof NotFoundError) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .json(responseNotFound(exception.message, 'Error Global', description, path));
    }

    if (exception instanceof ForbiddenError) {
      return response
        .status(HttpStatus.FORBIDDEN)
        .json(responseForbidden(exception.message, 'Error Global', description, path));
    }

    if (exception instanceof ConflictError) {
      return response
        .status(HttpStatus.CONFLICT)
        .json(responseConflict(exception.message, 'Error Global', description, path));
    }

    if (exception instanceof AlreadyCreatedError) {
      return response
        .status(HttpStatus.CONFLICT)
        .json(responseAlreadyCreated(exception.message, 'Error Global', description, path));
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message || 'Error HTTP';
      return response
        .status(status)
        .json(responseInternalServerError(message, 'Error HTTP', description, path));
    }

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(responseInternalServerError(
        (exception as any)?.message || 'Error interno del servidor',
        'Error Global',
        description,
        path
      ));
  }
}
