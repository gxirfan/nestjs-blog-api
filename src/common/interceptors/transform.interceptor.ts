import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document } from 'mongoose';

function normalizeValue(value: any): any {
  if (value == null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value instanceof Document) {
    return value.toObject({ virtuals: true });
  }

  if (typeof value === 'object') {
    const result: Record<string, any> = {};

    for (const key of Object.keys(value)) {
      result[key] = normalizeValue(value[key]);
    }

    return result;
  }

  return value;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        if (!data) return data;

        if (data.statusCode !== undefined && data.data !== undefined) {
          return {
            ...data,
            data: normalizeValue(data.data),
          };
        }

        return normalizeValue(data);
      }),
    );
  }
}
