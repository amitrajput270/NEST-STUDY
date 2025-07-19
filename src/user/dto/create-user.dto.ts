import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength, Min, Max } from 'class-validator';

export class CreateUserDto {
    @IsString({
        message: 'Name must be a string',
    })
    @IsNotEmpty({
        message: 'Name is required',
    })
    @MinLength(3, {
        message: 'Name must be at least 3 characters long',
    })
    name: string;

    @IsEmail({}, {
        message: 'Email must be a valid email address'
    })
    @IsNotEmpty({
        message: 'Email is required',
    })
    email: string;

    @IsInt({
        message: 'Age must be an integer',
    })
    @IsNotEmpty({
        message: 'Age is required',
    })
    @Min(1, {
        message: 'Age must be at least 1',
    })
    @Max(100, {
        message: 'Age must not exceed 120',
    })
    age: number;
}
