import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber, Min, Max } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNumber()
    @Min(13)
    @Max(120)
    age: number;
}
