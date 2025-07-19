import { User } from '../user.schema';

export interface UserRepository<T = any, ID = string> {
    create(data: Partial<T>): Promise<T>;
    findAll(): Promise<T[]>;
    findById(id: ID): Promise<T | null>;
    update(id: ID, data: Partial<T>): Promise<T | null>;
    delete(id: ID): Promise<T | null>;
    findByEmail(email: string): Promise<T | null>;
}
