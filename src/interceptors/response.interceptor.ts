import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from '../utils/response';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                // If the response is already a Response instance, return it as is
                if (data instanceof Response) {
                    return data;
                }

                // Get HTTP context
                const httpContext = context.switchToHttp();
                const response = httpContext.getResponse();
                const statusCode = response.statusCode;

                // If data has message and data properties, use them
                if (data && typeof data === 'object' && data.message) {
                    return new Response(statusCode, data.message, data.data || data);
                }

                // Default success message based on HTTP method
                const request = httpContext.getRequest();
                const method = request.method;

                let message = 'Success';
                switch (method) {
                    case 'POST':
                        message = 'Created successfully';
                        break;
                    case 'PUT':
                    case 'PATCH':
                        message = 'Updated successfully';
                        break;
                    case 'DELETE':
                        message = 'Deleted successfully';
                        break;
                    case 'GET':
                        message = 'Retrieved successfully';
                        break;
                }

                return new Response(statusCode, message, data);
            }),
        );
    }
}
