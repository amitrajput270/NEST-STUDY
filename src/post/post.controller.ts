import { Controller, Get, Post, Body, Put, Delete, NotFoundException, HttpStatus, Inject, Param, Query } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ValidObjectId } from '../utils/valid-object-id.decorator';
import { PostRepository } from './interfaces/post-repository.interface';
import { MongoPostService } from './post.service';
import { MysqlPostService } from './mysql-post.service';
import { PaginationDto, PaginationHelper } from '../utils/pagination';

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
    async findAll(@Query() paginationDto: PaginationDto, @Query('search') search?: string) {
        // If pagination parameters OR search OR sort parameters are provided, use paginated method
        if (paginationDto.page !== undefined && paginationDto.page !== null || search || paginationDto.sort) {
            // Determine if this is actual pagination (page parameter provided) vs filtering/sorting only
            const isActuallyPaginated = paginationDto.page !== undefined && paginationDto.page !== null;

            const result = await this.postRepo.findAllPaginated({
                page: paginationDto.page || 1,
                limit: paginationDto.limit || (isActuallyPaginated ? 10 : 1000), // Use 10 for pagination, 1000 for search/sort only
                sort: paginationDto.sort,
                order: paginationDto.order || 'ASC'
            }, search);

            // For non-paginated requests (no page parameter), set appropriate meta values
            const effectivePage = isActuallyPaginated ? result.page : 1;
            const effectiveLimit = isActuallyPaginated ? result.limit : result.total;

            const meta = PaginationHelper.generatePaginationMeta(
                result.total,
                effectivePage,
                effectiveLimit,
                result.data.length
            );

            return {
                message: 'Posts retrieved successfully',
                data: {
                    meta,
                    records: result.data
                }
            };
        }

        // Otherwise, return all posts with meta structure (basic case - no params at all)
        const posts = await this.postRepo.findAll();
        const meta = PaginationHelper.generatePaginationMeta(
            posts.length,
            1,
            posts.length,
            posts.length
        );

        return {
            message: 'Posts retrieved successfully',
            data: {
                meta,
                records: posts
            }
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
