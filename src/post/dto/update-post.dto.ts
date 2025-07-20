import { IsOptional, IsString, IsNumber, MaxLength, IsBoolean } from 'class-validator';

export class UpdatePostDto {
    @IsOptional()
    @IsNumber()
    userId?: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
