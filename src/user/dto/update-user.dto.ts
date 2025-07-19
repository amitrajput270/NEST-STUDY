import { IsEmail, IsInt, IsOptional, IsString, MinLength, Min, Max } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString({
        message: 'Name must be a string',
    })
    @MinLength(3, {
        message: 'Name must be at least 3 characters long',
    })
    name?: string;

    @IsOptional()
    @IsEmail({}, {
        message: 'Email must be a valid email address'
    })
    email?: string;

    @IsOptional()
    @IsInt({
        message: 'Age must be an integer',
    })
    @Min(1, {
        message: 'Age must be at least 1',
    })
    @Max(100, {
        message: 'Age must not exceed 120',
    })
    age?: number;
}
