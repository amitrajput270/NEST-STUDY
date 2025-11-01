import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    HttpCode,
    HttpStatus,
    Query,
    Get,
    Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';
import { FileUploadService } from './file-upload.service';
import { UploadResponseDto } from './dto';

@Controller('file-upload')
export class FileUploadController {
    constructor(private readonly fileUploadService: FileUploadService) { }

    /**
     * Upload and process a large CSV file
     * @param file The uploaded CSV file
     * @param batchSize Number of rows to process in each batch (default: 1000)
     */
    @Post('csv')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async uploadCsvFile(
        @UploadedFile() file: Express.Multer.File,
        @Query('batchSize') batchSize?: string,
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const batch = batchSize ? parseInt(batchSize, 10) : 1000;

            // Validate batch size
            if (isNaN(batch) || batch < 1 || batch > 10000) {
                throw new BadRequestException('Batch size must be between 1 and 10000');
            }

            // Process the CSV file
            const result = await this.fileUploadService.processCsvFile(
                file.path,
                batch,
            );

            // Optionally delete the file after processing
            // this.fileUploadService.deleteFile(file.path);

            return {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                uploadedAt: new Date(),
                rowsProcessed: result.processedRows,
                status: result.failedRows > 0 ? 'processing' : 'success',
                message: result.failedRows > 0
                    ? `Processed ${result.processedRows} rows successfully, ${result.failedRows} rows failed`
                    : `Successfully processed ${result.processedRows} rows`,
            };
        } catch (error) {
            // Clean up file on error
            if (file && file.path) {
                this.fileUploadService.deleteFile(file.path);
            }
            throw error;
        }
    }

    /**
     * Validate CSV structure before processing
     * @param file The uploaded CSV file
     * @param requiredColumns Comma-separated list of required column names
     */
    @Post('csv/validate')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async validateCsv(
        @UploadedFile() file: Express.Multer.File,
        @Query('requiredColumns') requiredColumns?: string,
    ): Promise<{
        valid: boolean;
        missingColumns: string[];
        fileInfo: {
            filename: string;
            size: number;
            headers: string[];
            estimatedRows: number;
        };
    }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const requiredCols = requiredColumns
                ? requiredColumns.split(',').map(col => col.trim())
                : [];

            // Validate structure
            const validation = await this.fileUploadService.validateCsvStructure(
                file.path,
                requiredCols,
            );

            // Get CSV info
            const info = await this.fileUploadService.getCsvInfo(file.path);

            // Delete file after validation
            this.fileUploadService.deleteFile(file.path);

            return {
                ...validation,
                fileInfo: {
                    filename: file.filename,
                    size: file.size,
                    headers: info.headers,
                    estimatedRows: info.estimatedRows,
                },
            };
        } catch (error) {
            // Clean up file on error
            if (file && file.path) {
                this.fileUploadService.deleteFile(file.path);
            }
            throw error;
        }
    }

    /**
     * Get information about a CSV file without processing it
     * @param file The uploaded CSV file
     */
    @Post('csv/info')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async getCsvInfo(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{
        filename: string;
        originalName: string;
        size: number;
        headers: string[];
        estimatedRows: number;
    }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const info = await this.fileUploadService.getCsvInfo(file.path);

            // Delete file after getting info
            this.fileUploadService.deleteFile(file.path);

            return {
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                ...info,
            };
        } catch (error) {
            // Clean up file on error
            if (file && file.path) {
                this.fileUploadService.deleteFile(file.path);
            }
            throw error;
        }
    }

    /**
     * Debug endpoint - Get first few rows of CSV without processing
     * @param file The uploaded CSV file
     */
    @Post('csv/debug')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async debugCsv(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{
        filename: string;
        size: number;
        headers: string[];
        sampleRows: any[];
    }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const debug = await this.fileUploadService.debugCsvFile(file.path, 5);

            // Delete file after debugging
            this.fileUploadService.deleteFile(file.path);

            return {
                filename: file.filename,
                size: file.size,
                ...debug,
            };
        } catch (error) {
            // Clean up file on error
            if (file && file.path) {
                this.fileUploadService.deleteFile(file.path);
            }
            throw error;
        }
    }
}