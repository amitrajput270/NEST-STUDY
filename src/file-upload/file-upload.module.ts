import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { multerConfig } from './config/multer.config';
import { FeesData } from './entities';

@Module({
    imports: [
        MulterModule.register(multerConfig),
        TypeOrmModule.forFeature([FeesData]),
    ],
    controllers: [FileUploadController],
    providers: [FileUploadService],
    exports: [FileUploadService],
})
export class FileUploadModule { }
