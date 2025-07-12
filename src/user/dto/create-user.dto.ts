import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString({
        message: 'Name must be a string',
    })
    @IsNotEmpty({
        message: 'Name is required',
    })
    @MinLength(3)
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
    age: number;
}
