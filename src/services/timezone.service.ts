import { Injectable } from '@nestjs/common';
import { TimezoneUtils } from '../utils/timezone.util';

@Injectable()
export class TimezoneService {
    /**
     * Get current server information including timezone
     */
    getServerInfo() {
        return {
            timezone: process.env.TZ || 'System default',
            currentTime: {
                utc: new Date().toISOString(),
                local: TimezoneUtils.formatKolkataTime(new Date()),
                timestamp: TimezoneUtils.getCurrentTimestamp()
            },
            timezoneInfo: {
                offset: TimezoneUtils.getTimezoneOffset(),
                isKolkata: TimezoneUtils.isKolkataTimezone()
            }
        };
    }

    /**
     * Format any date to Indian Standard Time
     */
    formatToIST(date: Date, options?: Intl.DateTimeFormatOptions) {
        return TimezoneUtils.formatKolkataTime(date, options);
    }

    /**
     * Convert date to IST and return ISO string for database storage
     */
    toISTForDatabase(date: Date = new Date()) {
        return TimezoneUtils.toISTString(date);
    }

    /**
     * Get time ranges for reports (useful for daily/monthly reports)
     */
    getTodayRange() {
        const now = TimezoneUtils.now();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        return {
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString(),
            formatted: {
                start: TimezoneUtils.formatKolkataTime(startOfDay),
                end: TimezoneUtils.formatKolkataTime(endOfDay)
            }
        };
    }

    /**
     * Get week range in IST
     */
    getThisWeekRange() {
        const now = TimezoneUtils.now();
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
                start: TimezoneUtils.formatKolkataTime(startOfWeek),
                end: TimezoneUtils.formatKolkataTime(endOfWeek)
            }
        };
    }
}
