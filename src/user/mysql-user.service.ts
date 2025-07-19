import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User as MysqlUser } from './user.entity';
import { UserRepository } from './interfaces/user-repository.interface';

/**
 * MysqlUserService implements UserRepository for MySQL using TypeORM.
 */
@Injectable()
export class MysqlUserService implements UserRepository<MysqlUser, number> {
    constructor(@InjectRepository(MysqlUser) private userRepo: Repository<MysqlUser>) {
        console.log('🔥 MysqlUserService instantiated - DB_TYPE:', process.env.DB_TYPE);
    }

    async create(data: Partial<MysqlUser>): Promise<MysqlUser> {
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

    async findAll(): Promise<MysqlUser[]> {
        return this.userRepo.find();
    }

    async findById(id: number): Promise<MysqlUser | null> {
        return this.userRepo.findOne({ where: { id } });
    }

    async update(id: number, data: Partial<MysqlUser>): Promise<MysqlUser | null> {
        await this.userRepo.update(id, data);
        return this.findById(id);
    }

    async delete(id: number): Promise<MysqlUser | null> {
        const user = await this.findById(id);
        if (!user) return null;

        await this.userRepo.remove(user);
        return user;
    }

    async findByEmail(email: string): Promise<MysqlUser | null> {
        return this.userRepo.findOne({ where: { email } });
    }
}
