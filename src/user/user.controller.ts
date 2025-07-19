import { Controller, Get, Post, Body, Put, Delete, NotFoundException, HttpStatus, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidObjectId } from '../utils/valid-object-id.decorator';
import { UserRepository } from './interfaces/user-repository.interface';

@Controller('user')
export class UserController {
    constructor(@Inject('UserRepository') private readonly userRepo: UserRepository) { }

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
    async findById(@ValidObjectId() id: string) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            message: 'User details found',
            data: user
        };
    }

    @Put(':id')
    async update(@ValidObjectId() id: string, @Body() data: UpdateUserDto) {
        const user = await this.userRepo.update(id, data);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            message: 'User updated successfully',
            data: user
        };
    }

    @Delete(':id')
    async delete(@ValidObjectId() id: string) {
        const user = await this.userRepo.delete(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            message: 'User deleted successfully',
            data: user
        };
    }
}
