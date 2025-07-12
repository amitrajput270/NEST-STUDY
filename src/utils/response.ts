import { HttpStatus } from '@nestjs/common';

export class Response {
    readonly statusCode: number;

    readonly message: string;

    readonly data: unknown;

    constructor(statusCode: number, message: string, data?: unknown) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data || null;
    }

    static create(message?: string, data?: unknown) {
        const resultMessage = message || 'Created';
        return new Response(HttpStatus.CREATED, resultMessage, data);
    }

    static ok(message?: string, data?: unknown) {
        const resultMessage = message || 'Success';
        return new Response(HttpStatus.OK, resultMessage, data);
    }

    static notFound() {
        return new Response(HttpStatus.NOT_FOUND, 'No data found', null);
    }

    static badRequest(message?: string, data?: unknown) {
        const resultMessage = message || 'Bad request';
        return new Response(HttpStatus.BAD_REQUEST, resultMessage, data);
    }

    static unauthorized(message?: string, data?: unknown) {
        const resultMessage = message || 'Unauthorized';
        return new Response(HttpStatus.UNAUTHORIZED, resultMessage, data);
    }

    static unprocessableEntity(message?: string, data?: unknown) {
        const resultMessage = message || '"Unprocessable entity';
        return new Response(HttpStatus.UNPROCESSABLE_ENTITY, resultMessage, data);
    }

    static error(statusCode?: number, message?: string, data?: unknown) {
        const resultStatusCode = statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        const resultMessage = message || 'Something went wrong';
        return new Response(resultStatusCode, resultMessage, data);
    }
}