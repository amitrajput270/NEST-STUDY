import { Controller, Get, Post, Body, Put, Delete, NotFoundException, HttpStatus, Inject, Param } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ValidObjectId } from '../utils/valid-object-id.decorator';
import { PostRepository } from './interfaces/post-repository.interface';
import { MongoPostService } from './post.service';
import { MysqlPostService } from './mysql-post.service';

// Get DB type at module load time
import * as dotenv from 'dotenv';
dotenv.config();
const dbType = process.env.DB_TYPE || 'mongodb';

@Controller('post')
export class PostController {
    constructor(
        @Inject(dbType === 'mysql' ? MysqlPostService : MongoPostService)
        private readonly postRepo: PostRepository<any, string | number>
    ) { }

    @Post()
    async create(@Body() data: CreatePostDto) {
        const post = await this.postRepo.create(data);
        return {
            message: 'Post created successfully',
            data: post
        };
    }

    @Get()
    async findAll() {
        const posts = await this.postRepo.findAll();
        return {
            message: 'Posts retrieved successfully',
            data: posts
        };
    }

    @Get('active')
    async findActive() {
        const posts = await this.postRepo.findActive();
        return {
            message: 'Active posts retrieved successfully',
            data: posts
        };
    }

    @Get('user/:userId')
    async findByUserId(@Param('userId') userId: string) {
        const posts = await this.postRepo.findByUserId(parseInt(userId, 10));
        return {
            message: 'User posts retrieved successfully',
            data: posts
        };
    }

    @Get(':id')
    async findById(@ValidObjectId() id: string | number) {
        const post = await this.postRepo.findById(id as any);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return {
            message: 'Post details found',
            data: post
        };
    }

    @Put(':id')
    async update(@ValidObjectId() id: string | number, @Body() data: UpdatePostDto) {
        const post = await this.postRepo.update(id as any, data);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return {
            message: 'Post updated successfully',
            data: post
        };
    }

    @Delete(':id')
    async delete(@ValidObjectId() id: string | number) {
        const post = await this.postRepo.delete(id as any);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return {
            message: 'Post deleted successfully',
            data: post
        };
    }
}
