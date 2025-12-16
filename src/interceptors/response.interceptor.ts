import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                // Always include trace key (null for success)
                return {
                    statusCode: context.switchToHttp().getResponse().statusCode || 200,
                    message: data?.message || 'Success',
                    data: data?.data ?? null,
                    errors: null,
                    trace: null,
                };
            })
        );
    }
}
