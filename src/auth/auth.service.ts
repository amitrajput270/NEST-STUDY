import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { UserRepository } from '../user/interfaces/user-repository.interface';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject('USER_REPOSITORY')
        private userRepository: UserRepository
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, name, age } = registerDto;

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const userData = {
            name,
            email,
            password: hashedPassword,
            age,
        };

        const user = await this.userRepository.create(userData);

        // Generate tokens
        return this.generateTokens(user);
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        return this.generateTokens(user);
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        const { refresh_token } = refreshTokenDto;

        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refresh_token, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Get user from database
            const user = await this.userRepository.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Generate new tokens
            return this.generateTokens(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async validateUser(payload: JwtPayload) {
        const user = await this.userRepository.findById(payload.sub as any);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age,
        };
    }

    private async generateTokens(user: any): Promise<AuthResponseDto> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };

        // Generate access token
        const access_token = this.jwtService.sign(payload);

        // Generate refresh token
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        });

        return {
            access_token,
            refresh_token,
            expires_in: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
            token_type: 'Bearer',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
            },
        };
    }
}
