import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { TimezoneUtils } from '../utils/timezone.util';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');
    private logFile: string;
    private logData: any[] = [];
    private lastChecked: number = 0;
    private sensitiveFields = ['password', 'token', 'secret', 'authorization', 'access_token', 'refresh_token'];

    constructor() {
        const now = new Date();
        this.logFile = this.getLogPath(now);
        this.ensureLogDirectory(now);
        this.initializeLogFile();
    }

    use(request: Request, response: Response, next: NextFunction): void {
        const { method, originalUrl, headers } = request;
        const requestTime = new Date();
        const requestId = Math.random().toString(36).substring(7);

        // Handle raw body for JSON parsing errors
        let body = request.body;
        if (headers['content-type']?.includes('application/json') && typeof request.body === 'string') {
            try {
                body = JSON.parse(request.body);
            } catch (error) {
                // Leave body as is if parsing fails
            }
        }

        // Log Request
        const requestLog = {
            timestamp: TimezoneUtils.formatForLogs(requestTime),
            type: 'REQUEST',
            id: requestId,
            method,
            url: originalUrl,
            body: this.sanitizeBody(body),
            headers: this.sanitizeHeaders(headers),
        };

        this.writeLog(requestLog);

        // Store the original methods
        const originalJson = response.json.bind(response);
        const originalEnd = response.end.bind(response);
        let responseBody: any;

        // Override json method
        response.json = function (body: any) {
            responseBody = body;
            return originalJson(body);
        };

        // Capture the response using on finish
        response.on('finish', () => {
            const responseTime = new Date();

            const responseLog = {
                timestamp: TimezoneUtils.formatForLogs(responseTime),
                type: 'RESPONSE',
                id: requestId,
                statusCode: response.statusCode,
                duration: `${responseTime.getTime() - requestTime.getTime()}ms`,
                body: this.sanitizeBody(responseBody.data || responseBody),
            };

            this.writeLog(responseLog);
        });

        next();
    }


    // sanitizes sensitive fields in the request headers
    private sanitizeHeaders(headers: any): any {
        if (!headers) return null;
        const sanitized = { ...headers };
        // Remove sensitive data
        for (const field of this.sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '******';
            }
        }
        return sanitized;
    }


    private sanitizeBody(body: any): any {
        if (!body) return null;
        const sanitized = { ...body };
        // Remove sensitive data
        for (const field of this.sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '******';
            }
        }
        return sanitized;
    }

    private checkFileChanges(): void {
        try {
            // Check if we need to rotate to a new day
            const now = new Date();
            const currentDatePath = this.getLogPath(now);

            if (this.logFile !== currentDatePath) {
                // We've crossed over to a new day, update the path
                this.logFile = currentDatePath;
                this.logData = [];
                this.ensureLogDirectory(now);
                this.writeInitialLog();
                return;
            }

            if (fs.existsSync(this.logFile)) {
                const stats = fs.statSync(this.logFile);
                if (stats.mtimeMs > this.lastChecked) {
                    // File was modified externally
                    const content = fs.readFileSync(this.logFile, 'utf8').trim();
                    if (!content) {
                        // File was emptied
                        this.logData = [];
                        this.writeInitialLog();
                    } else {
                        try {
                            const parsedData = JSON.parse(content);
                            if (Array.isArray(parsedData)) {
                                this.logData = parsedData;
                            } else {
                                this.logData = [];
                                this.writeInitialLog();
                            }
                        } catch (error) {
                            // Invalid JSON, reset the file
                            this.logData = [];
                            this.writeInitialLog();
                        }
                    }
                }
                this.lastChecked = Date.now();
            } else {
                // File was deleted, recreate directory structure and file
                this.ensureLogDirectory(now);
                this.logData = [];
                this.writeInitialLog();
            }
        } catch (error) {
            console.error('Error checking file changes:', error);
        }
    }

    private getLogPath(date: Date): string {
        // Convert date to Asia/Kolkata timezone for proper folder structure
        const kolkataDate = TimezoneUtils.toKolkataTime(date);
        const year = kolkataDate.getFullYear().toString();
        const month = (kolkataDate.getMonth() + 1).toString().padStart(2, '0');
        const day = kolkataDate.getDate().toString().padStart(2, '0');
        const dateStr = TimezoneUtils.formatForLogs(kolkataDate).split(' ')[0]; // Get YYYY-MM-DD part

        return path.join(
            process.cwd(),
            'logs',
            year,
            month,
            day,
            `${dateStr}.json`
        );
    }

    private ensureLogDirectory(date: Date): void {
        // Convert date to Asia/Kolkata timezone for proper folder structure
        const kolkataDate = TimezoneUtils.toKolkataTime(date);
        const year = kolkataDate.getFullYear().toString();
        const month = (kolkataDate.getMonth() + 1).toString().padStart(2, '0');
        const day = kolkataDate.getDate().toString().padStart(2, '0');
        const dateStr = TimezoneUtils.formatForLogs(kolkataDate).split(' ')[0]; // Get YYYY-MM-DD part

        const baseLogDir = path.join(process.cwd(), 'logs');
        const yearDir = path.join(baseLogDir, year);
        const monthDir = path.join(yearDir, month);
        const dayDir = path.join(monthDir, day);
        const dateDir = path.join(dayDir, dateStr);

        [baseLogDir, yearDir, monthDir, dayDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    private initializeLogFile(): void {
        try {
            if (fs.existsSync(this.logFile)) {
                const content = fs.readFileSync(this.logFile, 'utf8').trim();
                if (content) {
                    try {
                        this.logData = JSON.parse(content);
                        if (!Array.isArray(this.logData)) {
                            this.logData = [];
                            this.writeInitialLog();
                        }
                    } catch (error) {
                        this.logData = [];
                        this.writeInitialLog();
                    }
                } else {
                    this.writeInitialLog();
                }
            } else {
                this.writeInitialLog();
            }
            this.lastChecked = Date.now();
        } catch (error) {
            this.logData = [];
            this.writeInitialLog();
        }
    }

    private writeInitialLog(): void {
        const initialLog = {
            appName: process.env.npm_package_name || 'NestApp',
            timestamp: TimezoneUtils.formatForLogs(),
            type: 'SYSTEM',
            message: 'Log file initialized',
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            appVersion: process.env.npm_package_version || '1.0.0'
        };
        this.logData = [initialLog];
        this.persistLogs();
    }

    private persistLogs(): void {
        try {
            fs.writeFileSync(this.logFile, JSON.stringify(this.logData, null, 2));
            this.lastChecked = Date.now();
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    private writeLog(log: any): void {
        try {
            // Check for external file changes before writing
            this.checkFileChanges();

            // Add log to array
            this.logData.push(log);

            // Persist to file
            this.persistLogs();
        } catch (error) {
            console.error('Error in writeLog:', error);
            // Try to reinitialize the log file
            this.logData = [];
            this.writeInitialLog();
            // Try to write the log again
            this.logData.push(log);
            this.persistLogs();
        }
    }
}
