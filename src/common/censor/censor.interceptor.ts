import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CensorService } from './censor.service';

@Injectable()
export class CensorInterceptor implements NestInterceptor {
    constructor(private readonly censorService: CensorService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const body = request.body;

        const fieldsToCensor = ['content', 'title', 'bio', 'description']; 

        for (const field of fieldsToCensor) {
            if (body[field] && typeof body[field] === 'string') {
                body[field] = this.censorService.censor(body[field]);
            }
        }

        return next.handle();
    }
}