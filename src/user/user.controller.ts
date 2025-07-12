import { Controller, Get, Post, Body, Put, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'utils/response';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    userList(): object | string {
        return Response.ok('User data retrieved successfully', this.userService.userList());
    }

    @Get(':id')
    getUser(@Param('id') id: string): object | string {
        const response = this.userService.getUser(id);
        return Response.ok('User retrieved successfully', response);
    }

    @Post()
    createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto): string {
        return this.userService.createUser(createUserDto);
    }

    @Put(':id')
    updateUser(@Body() createUserDto: CreateUserDto, @Param('id') id: string): object | string {
        return this.userService.updateUser(createUserDto, id);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string): string {
        return this.userService.deleteUser(id);
    }
}
