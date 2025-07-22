import { PaginationOptions, PaginationResult } from '../../utils/pagination';

export interface UserRepository<T = any, ID = string> {
    create(data: Partial<T>): Promise<T>;
    findAll(): Promise<T[]>;
    findAllPaginated(options: PaginationOptions, search?: string): Promise<PaginationResult<T>>;
    findById(id: ID): Promise<T | null>;
    update(id: ID, data: Partial<T>): Promise<T | null>;
    delete(id: ID): Promise<T | null>;
    findByEmail(email: string): Promise<T | null>;
    findAllWithPosts(): Promise<T[]>;
}
