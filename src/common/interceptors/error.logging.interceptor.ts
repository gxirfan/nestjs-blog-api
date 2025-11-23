import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ErrorsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HttpError'); 

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, ip } = request;

    return next.handle().pipe(
      catchError(err => {
        
        const status = err.getStatus ? err.getStatus() : 500;
        
        if (status >= 400) {
            this.logger.error(
                `[${method}] [${status}] ${originalUrl} - Payload: ${JSON.stringify(request.body || {})} - Error: ${err.message} from IP: ${ip}`
            );
        }
        
        return throwError(() => err);
      }),
    );
  }
}