import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class CustomValidationPipe extends ValidationPipe {
    protected formatErrors(errors: ValidationError[]): any {
        const errorMap: Record<string, string[]> = {};

        errors.forEach(error => {
            this.processValidationError(error, errorMap);
        });

        throw new BadRequestException({
            message: 'Validation failed',
            errors: errorMap
        });
    }

    private processValidationError(error: ValidationError, errorMap: Record<string, string[]>, parentProperty = '') {
        const propertyName = parentProperty ? `${parentProperty}.${error.property}` : error.property;

        if (error.constraints) {
            if (!errorMap[propertyName]) {
                errorMap[propertyName] = [];
            }

            // Add all constraint messages for this property
            Object.values(error.constraints).forEach(constraint => {
                errorMap[propertyName].push(constraint);
            });
        }

        // Handle nested validation errors
        if (error.children && error.children.length > 0) {
            error.children.forEach(child => {
                this.processValidationError(child, errorMap, propertyName);
            });
        }
    }
}
