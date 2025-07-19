import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRepository } from './interfaces/user-repository.interface';

/**
 * MysqlUserService implements UserRepository for MySQL using TypeORM.
 */
@Injectable()
export class MysqlUserService implements UserRepository {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) {
        // console.log('MysqlUserService instantiated');
    }

    async create(data: Partial<User>): Promise<User> {
        // Check for duplicate email
        const existingUser = await this.userRepo.findOne({ where: { email: data.email } });
        if (existingUser) {
            throw new ConflictException({
                message: 'Validation failed',
                errors: { email: ['Email already exists'] }
            });
        }
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepo.find();
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { id } });
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        await this.userRepo.update(id, data);
        return this.findById(id);
    }

    async delete(id: string): Promise<User | null> {
        const user = await this.findById(id);
        if (user) {
            await this.userRepo.delete(id);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { email } });
    }
}
