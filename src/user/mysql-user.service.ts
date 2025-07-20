import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User as MysqlUser } from '../entitesAndSchema/user.entity';
import { UserRepository } from './interfaces/user-repository.interface';
import { PaginationOptions, PaginationResult, PaginationHelper } from '../utils/pagination';

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

    async findAllPaginated(options: PaginationOptions, search?: string): Promise<PaginationResult<MysqlUser>> {
        const queryBuilder = this.userRepo.createQueryBuilder('user');

        // Add search functionality
        if (search) {
            queryBuilder.where(
                'user.name LIKE :search OR user.email LIKE :search',
                { search: `%${search}%` }
            );
        }

        // Add sorting
        if (options.sort) {
            const sortField = options.sort.startsWith('user.') ? options.sort : `user.${options.sort}`;
            queryBuilder.orderBy(sortField, options.order);
        } else {
            queryBuilder.orderBy('user.id', options.order);
        }

        // Use pagination helper for TypeORM
        const { data, total } = await PaginationHelper.paginateTypeORM<MysqlUser>(
            queryBuilder,
            options.page,
            options.limit
        );

        return {
            data,
            total,
            page: options.page,
            limit: options.limit,
        };
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
