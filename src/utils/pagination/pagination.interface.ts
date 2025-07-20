import { PaginationDto } from './pagination.dto';

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
    search?: string;
}

export interface PaginationMeta {
    totalPages: number;
    currentPage: number;
    totalRecords: number;
    recordsOnCurrentPage: number;
    recordFrom: number;
    recordTo: number;
}

export interface PaginatedResponse<T> {
    data: {
        meta: PaginationMeta;
        records: T[];
    };
}

export interface PaginationOptions {
    page: number;
    limit: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export { PaginationDto };
