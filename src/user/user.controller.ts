import { Controller, Get, Post, Body, Put, Delete, NotFoundException, HttpStatus, Inject, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidObjectId } from '../utils/validations/valid-object-id.decorator';
import { UserRepository } from './interfaces/user-repository.interface';
import { MongoUserService } from './user.service';
import { MysqlUserService } from './mysql-user.service';
import { PaginationDto, PaginationHelper } from '../utils/pagination';

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
    async findAll(@Query() paginationDto: PaginationDto, @Query('search') search?: string) {
        // If pagination parameters OR search OR sort parameters are provided, use paginated method
        if (paginationDto.page !== undefined && paginationDto.page !== null || search || paginationDto.sort) {
            // Determine if this is actual pagination (page parameter provided) vs filtering/sorting only
            const isActuallyPaginated = paginationDto.page !== undefined && paginationDto.page !== null;

            const result = await this.userRepo.findAllPaginated({
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
                message: 'Users retrieved successfully',
                data: {
                    meta,
                    records: result.data
                }
            };
        }

        // Otherwise, return all users with meta structure (basic case - no params at all)
        const users = await this.userRepo.findAll();
        const meta = PaginationHelper.generatePaginationMeta(
            users.length,
            1,
            users.length,
            users.length
        );

        return {
            message: 'Users retrieved successfully',
            data: {
                meta,
                records: users
            }
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
