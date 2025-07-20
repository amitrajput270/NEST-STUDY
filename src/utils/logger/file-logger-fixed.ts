import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TimezoneUtils } from '../timezone.util';

export class FileLogger {
    private static instance: FileLogger;
    private logDirectory: string;

    private constructor() {
        this.logDirectory = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }

    static getInstance(): FileLogger {
        if (!FileLogger.instance) {
            FileLogger.instance = new FileLogger();
        }
        return FileLogger.instance;
    }

    private ensureLogDirectory(): void {
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }

    private getLogFileName(type: 'error' | 'access' | 'general' = 'general'): string {
        // Get date in Asia/Kolkata timezone and format as YYYY-MM-DD
        const kolkataDate = TimezoneUtils.formatForLogs().split(' ')[0]; // Get just the date part
        return path.join(this.logDirectory, `${type}-${kolkataDate}.log`);
    }

    private writeToFile(fileName: string, data: any): void {
        try {
            const logEntry = {
                timestamp: TimezoneUtils.formatForLogs(),
                ...data
            };

            const logString = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(fileName, logString, 'utf8');
        } catch (error) {
            // Fallback to console if file writing fails
            console.error('Failed to write to log file:', error);
            console.log('Log data:', data);
        }
    }

    logError(message: string, context?: any): void {
        const fileName = this.getLogFileName('error');
        this.writeToFile(fileName, {
            level: 'ERROR',
            message,
            context
        });

        // Also log to console
        const logger = new Logger('FileLogger');
        // logger.error(message, context);
    }

    logInfo(message: string, context?: any): void {
        const fileName = this.getLogFileName('general');
        this.writeToFile(fileName, {
            level: 'INFO',
            message,
            context
        });

        // Also log to console
        const logger = new Logger('FileLogger');
        // logger.log(message);
    }

    logAccess(requestData: any): void {
        const fileName = this.getLogFileName('access');
        this.writeToFile(fileName, {
            level: 'ACCESS',
            ...requestData
        });
    }

    logJSONParseError(error: any, requestData: any): void {
        const fileName = this.getLogFileName('error');
        this.writeToFile(fileName, {
            level: 'ERROR',
            type: 'JSON_PARSE_ERROR',
            message: error.message,
            error_details: {
                name: error.name,
                stack: error.stack
            },
            request: {
                url: requestData.url,
                method: requestData.method,
                rawBody: requestData.rawBody,
                headers: requestData.headers,
                timestamp: TimezoneUtils.formatForLogs()
            }
        });

        // Also log to console with NestJS logger
        const logger = new Logger('JSONParseError');
        // logger.error(`JSON Parse Error: ${error.message}`, {
        //     url: requestData.url,
        //     method: requestData.method,
        //     rawBody: requestData.rawBody?.toString(),
        //     headers: requestData.headers
        // });
    }
}
