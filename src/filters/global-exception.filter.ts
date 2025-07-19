import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Response } from '../utils/response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly statusMessageMap: Record<number, string> = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        422: 'Unprocessable Entity',
        500: 'Internal server error',
    };

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ExpressResponse>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errors: any = null;
        let trace: { file: string; line: string; column: string } | null = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || exception.message;
                // if message is blank, use statusMessageMap
                if ((message === null || message === '') && status in this.statusMessageMap && !errors) {
                    message = this.statusMessageMap[status];
                }

                if ((exceptionResponse as any).errors && typeof (exceptionResponse as any).errors === 'object') {
                    errors = (exceptionResponse as any).errors;
                }
                // If message is an array, treat as validation errors
                if (Array.isArray(message)) {
                    errors = this.groupValidationErrors(message);
                    message = status in this.statusMessageMap ? this.statusMessageMap[status] : 'Validation failed';
                }
                // Use statusMessageMap for error detail if message is a string and no errors
                if (typeof message === 'string' && status in this.statusMessageMap && !errors) {
                    errors = message;
                    message = this.statusMessageMap[status];
                }
            } else {
                message = exceptionResponse as string;
                if (status in this.statusMessageMap) {
                    errors = message;
                    message = this.statusMessageMap[status];
                }
            }
        } else {
            message = exception.message || 'Internal server error';
        }

        // Add file name and line number from stack trace if available
        if (exception.stack) {
            const stackLines = exception.stack.split('\n');
            if (stackLines.length > 1) {
                const match = stackLines[1].match(/\(([^:]+):(\d+):(\d+)\)/);
                if (match) {
                    trace = {
                        file: match[1],
                        line: match[2],
                        column: match[3],
                    };
                }
            }
        }
        // Always include trace key, even if null
        const responseData = {
            statusCode: status,
            message,
            data: null,
            errors,
            trace,
        };
        response.status(status).json(responseData);
    }

    // Helper to group validation errors by field/key
    private groupValidationErrors(messages: string[]): Record<string, string[]> {
        const errorMap: Record<string, string[]> = {};
        for (const msg of messages) {
            // Try to extract field name from message
            const match = msg.match(/^\w+\s/);
            if (match) {
                const key = match[0].trim().toLowerCase();
                if (!errorMap[key]) errorMap[key] = [];
                errorMap[key].push(msg);
            } else {
                if (!errorMap.general) errorMap.general = [];
                errorMap.general.push(msg);
            }
        }
        return errorMap;
    }
}
