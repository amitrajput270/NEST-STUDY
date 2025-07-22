import { Module, DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// User imports
import { User, UserSchema } from '../entitesAndSchema/user.schema';
import { User as MysqlUser } from '../entitesAndSchema/user.entity';
import { MongoUserService } from '../user/user.service';
import { MysqlUserService } from '../user/mysql-user.service';
import { UserRepository } from '../user/interfaces/user-repository.interface';

// Load environment variables at module load time
import * as dotenv from 'dotenv';
dotenv.config();

const dbType = process.env.DB_TYPE || 'mongodb';

@Module({})
export class AuthModule {
    static forRoot(): DynamicModule {
        const isMongoDb = dbType === 'mongodb';
        const isMysql = dbType === 'mysql';

        return {
            module: AuthModule,
            imports: [
                ConfigModule,
                PassportModule.register({ defaultStrategy: 'jwt' }),
                JwtModule.registerAsync({
                    imports: [ConfigModule],
                    useFactory: async (configService: ConfigService) => ({
                        secret: configService.get<string>('JWT_SECRET'),
                        signOptions: {
                            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
                        },
                    }),
                    inject: [ConfigService],
                }),
                ...(isMongoDb ? [MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema }
                ])] : []),
                ...(isMysql ? [TypeOrmModule.forFeature([MysqlUser])] : []),
            ],
            controllers: [AuthController],
            providers: [
                AuthService,
                JwtStrategy,
                ...(isMongoDb ? [
                    {
                        provide: 'USER_REPOSITORY',
                        useClass: MongoUserService,
                    }
                ] : []),
                ...(isMysql ? [
                    {
                        provide: 'USER_REPOSITORY',
                        useClass: MysqlUserService,
                    }
                ] : []),
            ],
            exports: [AuthService, JwtStrategy],
        };
    }
}
