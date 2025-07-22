import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { PostController } from './post.controller';
import { Post, PostSchema } from '../entitesAndSchema/post.schema';
import { User, UserSchema } from '../entitesAndSchema/user.schema';
import { Post as MysqlPost } from '../entitesAndSchema/post.entity';
import { User as MysqlUser } from '../entitesAndSchema/user.entity';
import { MongoPostService } from './post.service';
import { MysqlPostService } from './mysql-post.service';

// Load environment variables at module load time
import * as dotenv from 'dotenv';
dotenv.config();

const dbType = process.env.DB_TYPE || 'mongodb';

@Module({})
export class PostModule {
    static forRoot(): DynamicModule {
        const isMongoDb = dbType === 'mongodb';
        const isMysql = dbType === 'mysql';
        return {
            module: PostModule,
            imports: [
                ...(isMongoDb ? [MongooseModule.forFeature([
                    { name: Post.name, schema: PostSchema },
                    { name: User.name, schema: UserSchema }
                ])] : []),
                ...(isMysql ? [TypeOrmModule.forFeature([MysqlPost, MysqlUser])] : []),
            ],
            controllers: [PostController],
            providers: [
                ...(isMongoDb ? [MongoPostService] : []),
                ...(isMysql ? [MysqlPostService] : []),
            ],
            exports: [],
        };
    }
}
