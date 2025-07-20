import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { User, UserSchema } from '../entites/user.schema';
import { User as MysqlUser } from '../entites/user.entity';
import { MongoUserService } from './user.service';
import { MysqlUserService } from './mysql-user.service';

// Load environment variables at module load time
import * as dotenv from 'dotenv';
dotenv.config();

const dbType = process.env.DB_TYPE || 'mongodb';

@Module({})
export class UserModule {
    static forRoot(): DynamicModule {
        const isMongoDb = dbType === 'mongodb';
        const isMysql = dbType === 'mysql';
        return {
            module: UserModule,
            imports: [
                ...(isMongoDb ? [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])] : []),
                ...(isMysql ? [TypeOrmModule.forFeature([MysqlUser])] : []),
            ],
            controllers: [UserController],
            providers: [
                ...(isMongoDb ? [MongoUserService] : []),
                ...(isMysql ? [MysqlUserService] : []),
            ],
            exports: [],
        };
    }
}
