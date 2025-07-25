import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entitesAndSchema/user.schema';
import { UserRepository } from './interfaces/user-repository.interface';
import { PaginationOptions, PaginationResult, PaginationHelper } from '../utils/pagination';

@Injectable()
export class MongoUserService implements UserRepository<User, string> {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
        console.log('MongoUserService instantiated - DB_TYPE:', process.env.DB_TYPE);
    }

    async create(data: Partial<User>): Promise<User> {
        try {
            // Check if email already exists
            const existingUser = await this.userModel.findOne({ email: data.email });
            if (existingUser) {
                throw new ConflictException({
                    message: '',
                    errors: {
                        email: ['Email already exists']
                    }
                });
            }

            const user = new this.userModel(data);
            return user.save();
        } catch (error) {
            // Handle MongoDB duplicate key error
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue || {})[0];
                throw new ConflictException({
                    message: '',
                    errors: {
                        [field]: [`${field} already exists`]
                    }
                });
            }
            throw error;
        }
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findAllPaginated(options: PaginationOptions, search?: string): Promise<PaginationResult<User>> {
        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
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
        const { data, total } = await PaginationHelper.paginateMongoose<User>(
            this.userModel,
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

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<User | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findAllWithPosts(): Promise<User[]> {
        return this.userModel
            .find()
            .populate({
                path: 'posts',
                model: 'Post',
                select: 'title content isActive createdAt'
            })
            .exec();
    }
}
