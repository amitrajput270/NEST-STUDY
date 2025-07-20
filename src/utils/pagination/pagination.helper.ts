import {
    PaginationQuery,
    PaginationMeta,
    PaginatedResponse,
    PaginationOptions,
    PaginationResult
} from './pagination.interface';

export class PaginationHelper {
    /**
     * Calculate pagination metadata
     */
    static calculateMeta(total: number, page: number, limit: number): PaginationMeta {
        const totalPages = Math.ceil(total / limit);
        const recordFrom = total === 0 ? 0 : (page - 1) * limit + 1;
        const recordTo = Math.min(page * limit, total);
        const recordsOnCurrentPage = recordTo - recordFrom + 1;

        return {
            totalPages,
            currentPage: page,
            totalRecords: total,
            recordsOnCurrentPage: recordsOnCurrentPage > 0 ? recordsOnCurrentPage : 0,
            recordFrom,
            recordTo,
        };
    }

    /**
     * Create paginated response
     */
    static createPaginatedResponse<T>(
        data: T[],
        total: number,
        page: number,
        limit: number
    ): PaginatedResponse<T> {
        const meta = this.calculateMeta(total, page, limit);

        return {
            data: {
                meta,
                records: data,
            },
        };
    }

    /**
     * Get pagination options from query parameters
     */
    static getPaginationOptions(query: PaginationQuery): PaginationOptions {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 10));

        return {
            page,
            limit,
            sort: query.sort,
            order: query.order || 'DESC',
        };
    }

    /**
     * Calculate skip value for database queries
     */
    static getSkip(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    /**
     * Validate and sanitize pagination parameters
     */
    static validateParams(page?: number, limit?: number): { page: number; limit: number } {
        const validatedPage = Math.max(1, page || 1);
        const validatedLimit = Math.min(100, Math.max(1, limit || 10));

        return {
            page: validatedPage,
            limit: validatedLimit,
        };
    }

    /**
     * Create pagination response from a result with total count
     */
    static fromResult<T>(result: PaginationResult<T>): PaginatedResponse<T> {
        return this.createPaginatedResponse(
            result.data,
            result.total,
            result.page,
            result.limit
        );
    }

    /**
     * Helper for TypeORM pagination
     */
    static async paginateTypeORM<T>(
        queryBuilder: any,
        page: number,
        limit: number
    ): Promise<{ data: T[]; total: number }> {
        const skip = this.getSkip(page, limit);

        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Helper for Mongoose pagination
     */
    static async paginateMongoose<T>(
        model: any,
        query: any,
        page: number,
        limit: number,
        sort?: any
    ): Promise<{ data: T[]; total: number }> {
        const skip = this.getSkip(page, limit);

        const [data, total] = await Promise.all([
            model.find(query).skip(skip).limit(limit).sort(sort).exec(),
            model.countDocuments(query).exec(),
        ]);

        return { data, total };
    }

    /**
     * Generate enhanced pagination meta data
     */
    static generatePaginationMeta(
        total: number,
        page: number,
        limit: number,
        recordsCount: number
    ): PaginationMeta {
        const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 0;

        // Fix recordFrom and recordTo calculations for edge cases
        let recordFrom = 0;
        let recordTo = 0;

        if (total > 0 && recordsCount > 0) {
            recordFrom = ((page - 1) * limit) + 1;
            recordTo = Math.min(recordFrom + recordsCount - 1, total);
        }

        return {
            totalPages,
            currentPage: page,
            totalRecords: total,
            recordsOnCurrentPage: recordsCount,
            recordFrom,
            recordTo,
        };
    }
}
