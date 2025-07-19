import { Controller, Get, Post, Body, Put, Delete, NotFoundException, HttpStatus, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidObjectId } from '../utils/valid-object-id.decorator';
import { UserRepository } from './interfaces/user-repository.interface';
import { MongoUserService } from './user.service';
import { MysqlUserService } from './mysql-user.service';

// Get DB type at module load time
import * as dotenv from 'dotenv';
dotenv.config();
const dbType = process.env.DB_TYPE || 'mongodb';

@Controller('user')
export class UserController {
    constructor(
        @Inject(dbType === 'mysql' ? MysqlUserService : MongoUserService)
        private readonly userRepo: UserRepository<any, string | number>
    ) { }

    @Post()
    async create(@Body() data: CreateUserDto) {
        const user = await this.userRepo.create(data);
        return {
            message: 'User created successfully',
            data: user
        };
    }

    @Get()
    async findAll() {
        const users = await this.userRepo.findAll();
        return {
            message: 'Users retrieved successfully',
            data: users
        };
    }

    @Get(':id')
    async findById(@ValidObjectId() id: string | number) {
        const user = await this.userRepo.findById(id as any);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            message: 'User details found',
            data: user
        };
    }

    @Put(':id')
    async update(@ValidObjectId() id: string | number, @Body() data: UpdateUserDto) {
        const user = await this.userRepo.update(id as any, data);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            message: 'User updated successfully',
            data: user
        };
    }

    @Delete(':id')
    async delete(@ValidObjectId() id: string | number) {
        const user = await this.userRepo.delete(id as any);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            message: 'User deleted successfully',
            data: user
        };
    }
}
