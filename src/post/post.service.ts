import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../entitesAndSchema/post.schema';
import { Model } from 'mongoose';
import { PostRepository } from './interfaces/post-repository.interface';
import { PaginationOptions, PaginationResult, PaginationHelper } from '../utils/pagination';

@Injectable()
export class MongoPostService implements PostRepository<Post, string> {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
        console.log('MongoPostService instantiated - DB_TYPE:', process.env.DB_TYPE);
    }

    async create(data: Partial<Post>): Promise<Post> {
        try {
            const post = new this.postModel(data);
            return await post.save();
        } catch (error) {
            throw new ConflictException({
                message: 'Failed to create post',
                errors: error.message
            });
        }
    }

    async findAll(): Promise<Post[]> {
        return this.postModel.find().exec();
    }

    async findAllPaginated(options: PaginationOptions, search?: string): Promise<PaginationResult<Post>> {
        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Build sort object
        let sort = {};
        if (options.sort) {
            sort[options.sort] = options.order === 'ASC' ? 1 : -1;
        } else {
            sort = { _id: options.order === 'ASC' ? 1 : -1 };
        }

        // Use pagination helper for Mongoose
        const { data, total } = await PaginationHelper.paginateMongoose<Post>(
            this.postModel,
            query,
            options.page,
            options.limit,
            sort
        );

        return {
            data,
            total,
            page: options.page,
            limit: options.limit,
        };
    }

    async findById(id: string): Promise<Post | null> {
        return this.postModel.findById(id).exec();
    }

    async findByUserId(userId: number): Promise<Post[]> {
        return this.postModel.find({ userId }).exec();
    }

    async update(id: string, data: Partial<Post>): Promise<Post | null> {
        return this.postModel
            .findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true })
            .exec();
    }

    async delete(id: string): Promise<Post | null> {
        return this.postModel.findByIdAndDelete(id).exec();
    }

    async findActive(): Promise<Post[]> {
        return this.postModel.find({ isActive: true }).exec();
    }
}