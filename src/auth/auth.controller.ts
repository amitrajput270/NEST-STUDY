import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto): Promise<{
        statusCode: number;
        message: string;
        data: AuthResponseDto;
    }> {
        const result = await this.authService.register(registerDto);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'User registered successfully',
            data: result,
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<{
        statusCode: number;
        message: string;
        data: AuthResponseDto;
    }> {
        const result = await this.authService.login(loginDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Login successful',
            data: result,
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
        statusCode: number;
        message: string;
        data: AuthResponseDto;
    }> {
        const result = await this.authService.refreshToken(refreshTokenDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Token refreshed successfully',
            data: result,
        };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req): Promise<{
        statusCode: number;
        message: string;
        data: any;
    }> {
        return {
            statusCode: HttpStatus.OK,
            message: 'Profile retrieved successfully',
            data: req.user,
        };
    }
}
