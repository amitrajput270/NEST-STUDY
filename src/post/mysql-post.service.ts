import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post as MysqlPost } from '../entitesAndSchema/post.entity';
import { PostRepository } from './interfaces/post-repository.interface';
import { PaginationOptions, PaginationResult, PaginationHelper } from '../utils/pagination';

/**
 * MysqlPostService implements PostRepository for MySQL using TypeORM.
 */
@Injectable()
export class MysqlPostService implements PostRepository<MysqlPost, number> {
    constructor(@InjectRepository(MysqlPost) private postRepo: Repository<MysqlPost>) {
        console.log('MysqlPostService instantiated - DB_TYPE:', process.env.DB_TYPE);
    }

    async create(data: Partial<MysqlPost>): Promise<MysqlPost> {
        try {
            const post = this.postRepo.create(data);
            return this.postRepo.save(post);
        } catch (error) {
            throw new ConflictException({
                message: 'Failed to create post',
                errors: error.message
            });
        }
    }

    async findAll(): Promise<MysqlPost[]> {
        return this.postRepo.find();
    }

    async findAllPaginated(options: PaginationOptions, search?: string): Promise<PaginationResult<MysqlPost>> {
        const queryBuilder = this.postRepo.createQueryBuilder('post');

        // Add search functionality
        if (search) {
            queryBuilder.where(
                'post.title LIKE :search OR post.content LIKE :search',
                { search: `%${search}%` }
            );
        }

        // Add sorting
        if (options.sort) {
            const sortField = options.sort.startsWith('post.') ? options.sort : `post.${options.sort}`;
            queryBuilder.orderBy(sortField, options.order);
        } else {
            queryBuilder.orderBy('post.id', options.order);
        }

        // Use pagination helper for TypeORM
        const { data, total } = await PaginationHelper.paginateTypeORM<MysqlPost>(
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

    async findById(id: number): Promise<MysqlPost | null> {
        return this.postRepo.findOne({ where: { id } });
    }

    async findByUserId(userId: number): Promise<MysqlPost[]> {
        return this.postRepo.find({ where: { userId } });
    }

    async update(id: number, data: Partial<MysqlPost>): Promise<MysqlPost | null> {
        await this.postRepo.update(id, data);
        return this.findById(id);
    }

    async delete(id: number): Promise<MysqlPost | null> {
        const post = await this.findById(id);
        if (!post) return null;

        await this.postRepo.remove(post);
        return post;
    }

    async findActive(): Promise<MysqlPost[]> {
        return this.postRepo.find({ where: { isActive: true } });
    }

    async findAllWithUsers(): Promise<MysqlPost[]> {
        return this.postRepo.find({
            relations: ['user']
        });
    }
}
