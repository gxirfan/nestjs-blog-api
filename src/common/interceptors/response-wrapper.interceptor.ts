import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpStatus, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBaseResponse } from '../interfaces/base-response.interface';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseWrapperInterceptor<T> implements NestInterceptor<T, IBaseResponse<T>> {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<IBaseResponse<T>> {
    
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    const message = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY, 
      context.getHandler()
    );
    
    return next.handle().pipe(
      map(data => {
        if (data === null || data === undefined || (data.statusCode && data.success !== undefined)) {
            return data;
        }

        return {
          statusCode: response.statusCode || HttpStatus.OK,
          success: true,
          
          message: message || data.message || 'Success.', 
          
          data: data,
        };
      }),
    );
  }
}