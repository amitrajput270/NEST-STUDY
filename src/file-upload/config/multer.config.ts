import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

// Create uploads directory if it doesn't exist
const uploadPath = join(process.cwd(), 'uploads');
if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}

export const multerConfig: MulterOptions = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            cb(null, filename);
        },
    }),
    limits: {
        fileSize: 300 * 1024 * 1024, // 300 MB
        files: 1, // Allow only 1 file per request
    },
    fileFilter: (req, file, cb) => {
        // Only allow CSV files
        if (file.mimetype === 'text/csv' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new BadRequestException('Only CSV files are allowed'), false);
        }
    },
};
