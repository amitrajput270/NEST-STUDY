import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Response } from '../utils/response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<ExpressResponse>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: Record<string, string[]> | null = null;

        // Handle HTTP exceptions (like BadRequestException, NotFoundException, etc.)
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || exception.message;

                // Handle our custom validation errors format
                if ((exceptionResponse as any).errors && typeof (exceptionResponse as any).errors === 'object') {
                    errors = (exceptionResponse as any).errors;
                    message = (exceptionResponse as any).message || 'Validation failed';
                }
                // Handle standard validation errors
                else if (Array.isArray((exceptionResponse as any).message)) {
                    errors = this.transformValidationErrors((exceptionResponse as any).message);
                    message = 'Validation failed';
                }
            } else {
                message = exceptionResponse as string;
            }
        }
        // Handle Mongoose/MongoDB errors
        else if (exception.name === 'CastError') {
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid ID format';
        }
        else if (exception.code === 11000) {
            status = HttpStatus.CONFLICT;
            message = 'Validation failed';
            // Extract field name from MongoDB error and format properly
            const field = Object.keys(exception.keyValue || {})[0];
            if (field) {
                errors = {
                    [field]: [`${field} already exists`]
                };
            }
        }
        // Handle other errors
        else {
            message = exception.message || 'Internal server error';
        }

        const responseData = new Response(status, message, null, errors);

        response.status(status).json(responseData);
    }

    private transformValidationErrors(validationErrors: any[]): Record<string, string[]> {
        const errorMap: Record<string, string[]> = {};

        validationErrors.forEach(error => {
            if (error && typeof error === 'object' && error.property) {
                // Handle class-validator error objects (preferred method)
                const fieldName = error.property; // Use actual property name from DTO
                if (!errorMap[fieldName]) {
                    errorMap[fieldName] = [];
                }

                if (error.constraints) {
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
                        this.processNestedError(child, errorMap, fieldName);
                    });
                }
            } else if (typeof error === 'string') {
                // Fallback: Try to extract field name from string errors
                this.parseStringError(error, errorMap);
            }
        });

        return errorMap;
    }

    private processNestedError(error: any, errorMap: Record<string, string[]>, parentProperty = '') {
        const propertyName = parentProperty ? `${parentProperty}.${error.property}` : error.property;

        if (error.constraints) {
            if (!errorMap[propertyName]) {
                errorMap[propertyName] = [];
            }

            Object.values(error.constraints).forEach((constraint: any) => {
                if (typeof constraint === 'string') {
                    errorMap[propertyName].push(constraint);
                }
            });
        }

        if (error.children && Array.isArray(error.children)) {
            error.children.forEach((child: any) => {
                this.processNestedError(child, errorMap, propertyName);
            });
        }
    }

    private parseStringError(error: string, errorMap: Record<string, string[]>) {
        // For string errors, we can't reliably extract the property name
        // So we'll use a generic key or try to match common patterns
        let fieldName = 'general';

        // Try to extract lowercase property names from common validation patterns
        const patterns = [
            /^(\w+)\s+(must|should|is|cannot)/i,
            /(\w+)\s+is\s+required/i,
            /(\w+)\s+must\s+be/i,
        ];

        for (const pattern of patterns) {
            const match = error.match(pattern);
            if (match) {
                // Convert to lowercase to match DTO property names
                fieldName = match[1].toLowerCase();
                break;
            }
        }

        if (!errorMap[fieldName]) {
            errorMap[fieldName] = [];
        }
        errorMap[fieldName].push(error);
    }
}
