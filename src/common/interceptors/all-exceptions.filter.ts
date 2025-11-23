import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter'); 

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal Server Error';

    if (status >= 400) {
      this.logger.error(
        `[${request.method}] [${status}] ${request.originalUrl} - FAILED LOGIN/AUTH - Error: ${message} from IP: ${request.ip}`,
        // 500 errors for stack trace
        status === HttpStatus.INTERNAL_SERVER_ERROR ? exception : null 
      );
    }
    
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message,
      });
  }
}