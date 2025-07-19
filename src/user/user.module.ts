import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { User as MysqlUser } from './user.entity';
import { MongoUserService } from './user.service';
import { MysqlUserService } from './mysql-user.service';
import { UserRepository } from './interfaces/user-repository.interface';

@Module({
    imports: [
        // Register both MongoDB and MySQL models/entities
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        TypeOrmModule.forFeature([MysqlUser]),
    ],
    controllers: [UserController],
    providers: [
        MongoUserService,
        MysqlUserService,
        {
            provide: 'UserRepository',
            useClass: process.env.DB_TYPE === 'mysql' ? MysqlUserService : MongoUserService,
        },
    ],
    exports: ['UserRepository'],
})
export class UserModule { }
