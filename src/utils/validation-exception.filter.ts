import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Response } from './response';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ExpressResponse>();
        const exceptionResponse = exception.getResponse() as any;

        let message = 'Validation failed';
        let errors: Record<string, string[]> | null = null;

        if (typeof exceptionResponse === 'object') {
            // Handle our custom validation pipe format
            if (exceptionResponse.errors && typeof exceptionResponse.errors === 'object') {
                errors = exceptionResponse.errors;
                message = exceptionResponse.message || 'Validation failed';
            }
            // Handle standard NestJS validation errors
            else if (exceptionResponse.message) {
                if (Array.isArray(exceptionResponse.message)) {
                    // Transform validation errors to the desired format
                    errors = this.transformValidationErrors(exceptionResponse.message);
                    message = 'Validation failed';
                } else {
                    message = exceptionResponse.message;
                }
            }
        }

        const responseData = new Response(400, message, null, errors);

        response.status(400).json(responseData);
    }

    private transformValidationErrors(validationErrors: any[]): Record<string, string[]> {
        const errorMap: Record<string, string[]> = {};

        validationErrors.forEach(error => {
            // Handle different error formats
            if (typeof error === 'string') {
                // If it's a string, try to parse it
                this.parseStringError(error, errorMap);
            } else if (error && typeof error === 'object') {
                // If it's an object (from class-validator), extract field and constraints
                this.parseObjectError(error, errorMap);
            }
        });

        return errorMap;
    }

    private parseStringError(error: string, errorMap: Record<string, string[]>) {
        // Try to extract field name from string errors
        // Common patterns: "name must be...", "email is required", etc.
        let fieldName = 'unknown';
        let errorMessage = error;

        // Pattern 1: "fieldName constraint message"
        const fieldPattern = /^(\w+)\s+(must|should|is|cannot)/i;
        const match = error.match(fieldPattern);

        if (match) {
            fieldName = match[1];
        } else {
            // Pattern 2: Look for common validation words and assume previous word is field
            const validationWords = ['required', 'valid', 'empty', 'long', 'short'];
            const words = error.split(' ');

            for (let i = 0; i < words.length; i++) {
                if (validationWords.some(word => words[i].toLowerCase().includes(word))) {
                    if (i > 0) {
                        fieldName = words[i - 1].replace(/[^\w]/g, '');
                        break;
                    }
                }
            }
        }

        if (!errorMap[fieldName]) {
            errorMap[fieldName] = [];
        }
        errorMap[fieldName].push(errorMessage);
    }

    private parseObjectError(error: any, errorMap: Record<string, string[]>) {
        // Handle class-validator error objects
        if (error.property) {
            const fieldName = error.property;
            if (!errorMap[fieldName]) {
                errorMap[fieldName] = [];
            }

            if (error.constraints) {
                // Extract constraint messages
                Object.values(error.constraints).forEach((constraint: any) => {
                    if (typeof constraint === 'string') {
                        errorMap[fieldName].push(constraint);
                    }
                });
            } else if (error.message) {
                errorMap[fieldName].push(error.message);
            }

            // Handle nested validation errors
            if (error.children && Array.isArray(error.children)) {
                error.children.forEach((child: any) => {
                    this.parseObjectError(child, errorMap);
                });
            }
        }
    }
}
