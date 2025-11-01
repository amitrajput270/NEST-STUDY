import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createReadStream, unlinkSync } from 'fs';
import { parse } from 'csv-parse';
import { CsvRow, ProcessingResult } from './interfaces/csv-row.interface';
import { FileLogger } from '../utils/logger/file-logger';
import { FeesData } from './entities';

@Injectable()
export class FileUploadService {
    private readonly logger = FileLogger.getInstance();

    constructor(
        @InjectRepository(FeesData)
        private readonly feesDataRepository: Repository<FeesData>,
    ) { }

    /**
     * Process a CSV file using streaming to handle large files efficiently
     * @param filePath Path to the uploaded CSV file
     * @param batchSize Number of rows to process in each batch
     * @returns ProcessingResult with statistics
     */
    async processCsvFile(
        filePath: string,
        batchSize: number = 1000,
    ): Promise<ProcessingResult> {
        return new Promise((resolve, reject) => {
            const result: ProcessingResult = {
                totalRows: 0,
                processedRows: 0,
                failedRows: 0,
                errors: [],
            };

            const batch: CsvRow[] = [];

            const parser = parse({
                columns: true, // Use first row as header
                skip_empty_lines: true,
                trim: true,
                cast: false, // Don't auto-cast, we'll handle it manually
                cast_date: false,
                relax_quotes: true,
                relax_column_count: true,
                bom: true, // Handle UTF-8 BOM (Byte Order Mark)
            });

            const stream = createReadStream(filePath, { encoding: 'utf8' })
                .pipe(parser)
                .on('data', async (row: CsvRow) => {
                    result.totalRows++;

                    // Log first row for debugging
                    if (result.totalRows === 1) {
                        this.logger.logInfo('First CSV row received', {
                            row,
                            columns: Object.keys(row),
                        });
                    }

                    batch.push(row);

                    // Process batch when it reaches the batch size
                    if (batch.length >= batchSize) {
                        stream.pause(); // Pause stream while processing

                        try {
                            await this.processBatch([...batch]);
                            result.processedRows += batch.length;
                            batch.length = 0; // Clear batch
                            stream.resume(); // Resume stream
                        } catch (error) {
                            result.failedRows += batch.length;
                            result.errors.push({
                                row: result.totalRows,
                                error: error.message,
                            });
                            batch.length = 0;
                            stream.resume();
                        }
                    }
                })
                .on('end', async () => {
                    // Process remaining rows in the batch
                    if (batch.length > 0) {
                        try {
                            await this.processBatch(batch);
                            result.processedRows += batch.length;
                        } catch (error) {
                            result.failedRows += batch.length;
                            result.errors.push({
                                row: result.totalRows,
                                error: error.message,
                            });
                        }
                    }

                    this.logger.logInfo('CSV file processing completed', {
                        filePath,
                        result,
                    });

                    resolve(result);
                })
                .on('error', (error) => {
                    this.logger.logError('CSV file processing error', {
                        error: error.message,
                        filePath,
                    });
                    reject(new BadRequestException(`Failed to process CSV file: ${error.message}`));
                });
        });
    }

    /**
     * Process a batch of CSV rows
     * This method saves fees data to the database using bulk insert
     * @param batch Array of CSV rows
     */
    private async processBatch(batch: CsvRow[]): Promise<void> {
        try {
            // Transform CSV rows to FeesData entities
            const feesDataEntries = batch.map((row, index) => {
                const transformed = this.transformCsvRowToFeesData(row);

                // Log first entry for debugging
                if (index === 0) {
                    this.logger.logInfo('First transformed entry in batch', {
                        original: row,
                        transformed: transformed,
                    });
                }

                return transformed;
            });

            // Bulk insert into database
            // Using createQueryBuilder for better performance with large datasets
            await this.feesDataRepository
                .createQueryBuilder()
                .insert()
                .into(FeesData)
                .values(feesDataEntries)
                .execute();

            this.logger.logInfo('Batch processed successfully', {
                batchSize: batch.length,
            });
        } catch (error) {
            this.logger.logError('Error processing batch', {
                error: error.message,
                stack: error.stack,
                batchSize: batch.length,
                firstRow: batch[0],
            });
            throw error;
        }
    }

    /**
     * Transform CSV row to FeesData entity
     * Handles data type conversions and null values
     * @param row CSV row object
     * @returns FeesData entity
     */
    private transformCsvRowToFeesData(row: CsvRow): Partial<FeesData> {
        // Log the raw row for debugging (only for first few rows)
        const transformed = {
            sr: this.parseNumber(row.sr),
            date: this.parseDate(row.date),
            academic_year: this.parseString(row.academic_year),
            session: this.parseString(row.session),
            alloted_category: this.parseString(row.alloted_category),
            voucher_type: this.parseString(row.voucher_type),
            voucher_no: this.parseString(row.voucher_no),
            roll_no: this.parseString(row.roll_no),
            admno_uniqueid: this.parseString(row.admno_uniqueid),
            status: this.parseString(row.status),
            fee_category: this.parseString(row.fee_category),
            faculty: this.parseString(row.faculty),
            program: this.parseString(row.program),
            department: this.parseString(row.department),
            batch: this.parseString(row.batch),
            receipt_no: this.parseString(row.receipt_no),
            fee_head: this.parseString(row.fee_head),
            due_amount: this.parseDecimal(row.due_amount),
            paid_amount: this.parseDecimal(row.paid_amount),
            concession_amount: this.parseDecimal(row.concession_amount),
            scholarship_amount: this.parseDecimal(row.scholarship_amount),
            reverse_concession_amount: this.parseDecimal(row.reverse_concession_amount),
            write_off_amount: this.parseDecimal(row.write_off_amount),
            adjusted_amount: this.parseDecimal(row.adjusted_amount),
            refund_amount: this.parseDecimal(row.refund_amount),
            fund_trancfer_amount: this.parseDecimal(row.fund_trancfer_amount),
            remarks: this.parseString(row.remarks),
        };

        return transformed;
    }

    /**
     * Parse string value, handling empty strings and null
     */
    private parseString(value: any): string | undefined {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        return String(value).trim();
    }

    /**
     * Parse number value, handling empty strings and invalid numbers
     */
    private parseNumber(value: any): number | undefined {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        const num = parseInt(String(value), 10);
        return isNaN(num) ? undefined : num;
    }

    /**
     * Parse decimal value, handling empty strings and invalid numbers
     */
    private parseDecimal(value: any): number | undefined {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        const num = parseFloat(String(value));
        return isNaN(num) ? undefined : num;
    }

    /**
     * Parse date value, handling various date formats
     */
    private parseDate(value: any): Date | undefined {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }

        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
    }

    /**
     * Validate CSV file structure
     * @param filePath Path to the uploaded CSV file
     * @param requiredColumns Array of required column names
     */
    async validateCsvStructure(
        filePath: string,
        requiredColumns: string[] = [],
    ): Promise<{ valid: boolean; missingColumns: string[] }> {
        return new Promise((resolve, reject) => {
            const parser = parse({
                columns: true,
                to_line: 1, // Only read first row (header)
                bom: true, // Handle UTF-8 BOM
            });

            const stream = createReadStream(filePath, { encoding: 'utf8' })
                .pipe(parser)
                .on('data', (row: CsvRow) => {
                    const headers = Object.keys(row);
                    const missingColumns = requiredColumns.filter(
                        col => !headers.includes(col),
                    );

                    resolve({
                        valid: missingColumns.length === 0,
                        missingColumns,
                    });
                })
                .on('error', (error) => {
                    reject(new BadRequestException(`Failed to validate CSV structure: ${error.message}`));
                });
        });
    }

    /**
     * Delete uploaded file
     * @param filePath Path to the file to delete
     */
    deleteFile(filePath: string): void {
        try {
            unlinkSync(filePath);
            this.logger.logInfo('File deleted', { filePath });
        } catch (error) {
            this.logger.logError('Failed to delete file', {
                error: error.message,
                filePath
            });
        }
    }

    /**
     * Get CSV file information without processing
     * @param filePath Path to the uploaded CSV file
     */
    async getCsvInfo(filePath: string): Promise<{
        headers: string[];
        estimatedRows: number;
    }> {
        return new Promise((resolve, reject) => {
            let rowCount = 0;
            let headers: string[] = [];

            const parser = parse({
                columns: true,
                skip_empty_lines: true,
                bom: true, // Handle UTF-8 BOM
            });

            const stream = createReadStream(filePath, { encoding: 'utf8' })
                .pipe(parser)
                .on('data', (row: CsvRow) => {
                    if (rowCount === 0) {
                        headers = Object.keys(row);
                    }
                    rowCount++;
                })
                .on('end', () => {
                    resolve({
                        headers,
                        estimatedRows: rowCount,
                    });
                })
                .on('error', (error) => {
                    reject(new BadRequestException(`Failed to get CSV info: ${error.message}`));
                });
        });
    }

    /**
     * Debug CSV file - Get first N rows to inspect data
     * @param filePath Path to the uploaded CSV file
     * @param numRows Number of rows to return (default: 5)
     */
    async debugCsvFile(filePath: string, numRows: number = 5): Promise<{
        headers: string[];
        sampleRows: any[];
    }> {
        return new Promise((resolve, reject) => {
            const sampleRows: any[] = [];
            let headers: string[] = [];
            let rowCount = 0;

            const parser = parse({
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true, // Handle UTF-8 BOM
            });

            const stream = createReadStream(filePath, { encoding: 'utf8' })
                .pipe(parser)
                .on('data', (row: CsvRow) => {
                    if (rowCount === 0) {
                        headers = Object.keys(row);
                    }

                    if (rowCount < numRows) {
                        sampleRows.push(row);
                    }

                    rowCount++;

                    // Stop after reading required rows
                    if (rowCount >= numRows) {
                        stream.destroy();
                    }
                })
                .on('end', () => {
                    resolve({
                        headers,
                        sampleRows,
                    });
                })
                .on('close', () => {
                    resolve({
                        headers,
                        sampleRows,
                    });
                })
                .on('error', (error) => {
                    reject(new BadRequestException(`Failed to debug CSV file: ${error.message}`));
                });
        });
    }
}
