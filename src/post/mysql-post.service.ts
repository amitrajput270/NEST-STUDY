import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post as MysqlPost } from './post.entity';
import { PostRepository } from './interfaces/post-repository.interface';

/**
 * MysqlPostService implements PostRepository for MySQL using TypeORM.
 */
@Injectable()
export class MysqlPostService implements PostRepository<MysqlPost, number> {
    constructor(@InjectRepository(MysqlPost) private postRepo: Repository<MysqlPost>) {
        console.log('🔥 MysqlPostService instantiated - DB_TYPE:', process.env.DB_TYPE);
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
}
