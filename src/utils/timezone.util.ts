/**
 * Timezone utility for handling date/time operations in Asia/Kolkata timezone
 */
export class TimezoneUtils {
    private static readonly TIMEZONE = 'Asia/Kolkata';

    /**
     * Get current date/time in Asia/Kolkata timezone
     */
    static now(): Date {
        return new Date(new Date().toLocaleString('en-US', { timeZone: this.TIMEZONE }));
    }

    /**
     * Convert any date to Asia/Kolkata timezone
     */
    static toKolkataTime(date: Date): Date {
        return new Date(date.toLocaleString('en-US', { timeZone: this.TIMEZONE }));
    }

    /**
     * Format date in Asia/Kolkata timezone
     */
    static formatKolkataTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
        const defaultOptions: Intl.DateTimeFormatOptions = {
            timeZone: this.TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        return date.toLocaleString('en-IN', { ...defaultOptions, ...options });
    }

    /**
     * Get timezone offset for Asia/Kolkata
     */
    static getTimezoneOffset(): string {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const kolkataTime = new Date(utcTime + (5.5 * 3600000)); // IST is UTC+5:30
        const offset = kolkataTime.getTimezoneOffset() / -60;
        return `UTC${offset >= 0 ? '+' : ''}${offset}:${offset % 1 === 0 ? '00' : '30'}`;
    }

    /**
     * Check if current system timezone is Asia/Kolkata
     */
    static isKolkataTimezone(): boolean {
        return Intl.DateTimeFormat().resolvedOptions().timeZone === this.TIMEZONE;
    }

    /**
     * Get current timestamp in Asia/Kolkata timezone (for database storage)
     */
    static getCurrentTimestamp(): string {
        return this.now().toISOString();
    }

    /**
     * Convert date to IST and return as ISO string
     */
    static toISTString(date: Date = new Date()): string {
        return this.toKolkataTime(date).toISOString();
    }

    /**
     * Get today's date range in IST (start of day to end of day)
     */
    static getTodayRange() {
        const now = this.now();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        return {
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString(),
            formatted: {
                start: this.formatKolkataTime(startOfDay),
                end: this.formatKolkataTime(endOfDay)
            }
        };
    }

    /**
     * Get this week's date range in IST (Sunday to Saturday)
     */
    static getThisWeekRange() {
        const now = this.now();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        return {
            start: startOfWeek.toISOString(),
            end: endOfWeek.toISOString(),
            formatted: {
                start: this.formatKolkataTime(startOfWeek),
                end: this.formatKolkataTime(endOfWeek)
            }
        };
    }
}
