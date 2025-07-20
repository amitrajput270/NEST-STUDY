import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

// Load environment variables to detect DB type
import * as dotenv from 'dotenv';
dotenv.config();

const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

const isValidInteger = (id: string): boolean => {
    return /^\d+$/.test(id) && parseInt(id) > 0;
};

export const ValidObjectId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const id = request.params.id;
        const dbType = process.env.DB_TYPE || 'mongodb';

        if (dbType === 'mongodb') {
            // MongoDB ObjectId validation
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequestException('Invalid ObjectId format');
            }
            return id; // Return as string for MongoDB
        } else if (dbType === 'mysql') {
            // MySQL ID validation (UUID or integer)
            if (!isValidUUID(id) && !isValidInteger(id)) {
                throw new BadRequestException('Invalid ID format. Expected UUID or integer.');
            }
            // Return as number for MySQL integer IDs, or string for UUIDs
            return isValidInteger(id) ? parseInt(id, 10) : id;
        } else {
            // Generic validation fallback
            if (!id || id.trim() === '') {
                throw new BadRequestException('Invalid ID format');
            }
            return id;
        }
    },
);
