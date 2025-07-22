import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { User, UserSchema } from '../entitesAndSchema/user.schema';
import { Post, PostSchema } from '../entitesAndSchema/post.schema';
import { User as MysqlUser } from '../entitesAndSchema/user.entity';
import { Post as MysqlPost } from '../entitesAndSchema/post.entity';
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
                ...(isMongoDb ? [MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                    { name: Post.name, schema: PostSchema }
                ])] : []),
                ...(isMysql ? [TypeOrmModule.forFeature([MysqlUser, MysqlPost])] : []),
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
