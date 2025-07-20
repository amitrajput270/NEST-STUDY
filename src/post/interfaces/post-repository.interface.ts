import { PaginationOptions, PaginationResult } from '../../utils/pagination';

export interface PostRepository<T = any, ID = string> {
    create(data: Partial<T>): Promise<T>;
    findAll(): Promise<T[]>;
    findAllPaginated(options: PaginationOptions, search?: string): Promise<PaginationResult<T>>;
    findById(id: ID): Promise<T | null>;
    findByUserId(userId: number): Promise<T[]>;
    update(id: ID, data: Partial<T>): Promise<T | null>;
    delete(id: ID): Promise<T | null>;
    findActive(): Promise<T[]>;
}
