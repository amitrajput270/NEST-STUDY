import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Response } from '../utils/response';
import { FileLogger } from '../utils/logger/file-logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('GlobalExceptionFilter');
    private readonly fileLogger = FileLogger.getInstance();

    private readonly statusMessageMap: Record<number, string> = {
        // 1xx Informational
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',

        // 2xx Success
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',

        // 3xx Redirection
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',

        // 4xx Client Errors
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Payload Too Large',
        414: 'URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Range Not Satisfiable',
        417: 'Expectation Failed',
        418: "I'm a teapot 😄",
        422: 'Unprocessable Entity',
        423: 'Locked',
        424: 'Failed Dependency',
        429: 'Too Many Requests',

        // 5xx Server Errors
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported',
    };

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ExpressResponse>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errors: any = null;
        let trace: { file: string; line: string; column: string } | null = null;

        // Log the exception details for debugging (both console and file), validation errors included
        // this.fileLogger.logError(`Exception caught: ${exception.message}`, {
        //     url: request.url,
        //     method: request.method,
        //     body: request.body,
        //     headers: request.headers,
        //     stack: exception.stack,
        //     type: exception.constructor.name,
        //     status: status
        // });

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
            // For non-HttpException errors, always set message to 'Internal server error' and errors to exception.message
            if (status in this.statusMessageMap) {
                message = this.statusMessageMap[status];
                errors = exception.message || null;
            }
        }

        // Add file name and line number from stack trace if available
        if (exception.stack) {
            const stackLines = exception.stack.split('\n');
            if (stackLines.length > 1) {
                // Try different patterns for stack trace parsing
                let match = stackLines[1].match(/\(([^:]+):(\d+):(\d+)\)/);
                if (!match) {
                    // Alternative pattern for different error types
                    match = stackLines[1].match(/at\s+([^:]+):(\d+):(\d+)/);
                }
                if (!match && stackLines.length > 2) {
                    // Try the second line if first doesn't match
                    match = stackLines[2].match(/\(([^:]+):(\d+):(\d+)\)/);
                    if (!match) {
                        match = stackLines[2].match(/at\s+([^:]+):(\d+):(\d+)/);
                    }
                }
                if (match) {
                    trace = {
                        file: match[1],
                        line: match[2],
                        column: match[3],
                    };
                } else {
                    // For JSON parsing errors, provide generic trace info
                    trace = {
                        file: 'body-parser',
                        line: '0',
                        column: '0'
                    };
                }
            }
        } else if (exception.message && exception.message.includes('JSON')) {
            // Special handling for JSON parsing errors
            trace = {
                file: 'express-body-parser',
                line: '0',
                column: '0'
            };
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
