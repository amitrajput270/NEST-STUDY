import { User } from '../user.schema';

export interface UserRepository {
    create(data: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}
