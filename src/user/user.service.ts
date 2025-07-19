import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(data: Partial<User>): Promise<User> {
        try {
            // Check if email already exists
            const existingUser = await this.userModel.findOne({ email: data.email });
            if (existingUser) {
                throw new ConflictException({
                    message: 'Validation failed',
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
                    message: 'Validation failed',
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

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<User | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

}
