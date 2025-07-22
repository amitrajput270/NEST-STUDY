import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';
import { CatsModule } from './cats/cats.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { PostModule } from './post/post.module';

// Load environment variables
const dbType = process.env.DB_TYPE || 'mongodb';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
      cache: true,
      validate,
    }),
    ...(dbType === 'mongodb' ? [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('mongodb.uri'),
          dbName: configService.get<string>('mongodb.name'),
        }),
        inject: [ConfigService],
      })
    ] : []),
    ...(dbType === 'mysql' ? [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          type: 'mysql',
          host: configService.get('mysql.host'),
          port: configService.get('mysql.port'),
          username: configService.get('mysql.username'),
          password: configService.get('mysql.password'),
          database: configService.get('mysql.database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true, // set to false in production!
          logging: false, // Enable logging to debug connection issues
        }),
        inject: [ConfigService],
      })
    ] : []),
    CatsModule,
    AuthModule.forRoot(),
    UserModule.forRoot(),
    PostModule.forRoot(), // Dynamic module for Post
  ],
  controllers: [AppController, CatsController],
  providers: [AppService, CatsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
