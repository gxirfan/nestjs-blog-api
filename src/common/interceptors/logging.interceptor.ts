import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const { statusCode } = res;
                const duration = Date.now() - start;

                this.logger.log(
                    `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${userAgent} ${ip}`,
                );
            }),
        );
    }
}