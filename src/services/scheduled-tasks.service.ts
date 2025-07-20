import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TimezoneUtils } from '../utils/timezone.util';

@Injectable()
export class ScheduledTasksService {

    /**
     * Run every day at 9:00 AM IST
     */
    @Cron('0 9 * * *', { timeZone: 'Asia/Kolkata' })
    dailyMorningTask() {
        const currentTime = TimezoneUtils.formatKolkataTime(new Date());
        console.log(`Daily morning task executed at: ${currentTime}`);

        // Example: Generate daily reports, cleanup old data, etc.
        this.generateDailyReport();
    }

    /**
     * Run every hour at the top of the hour IST
     */
    @Cron('0 * * * *', { timeZone: 'Asia/Kolkata' })
    hourlyTask() {
        const currentTime = TimezoneUtils.formatKolkataTime(new Date());
        console.log(`Hourly task executed at: ${currentTime}`);

        // Example: Health checks, data synchronization, etc.
    }

    /**
     * Run every Monday at 10:00 AM IST
     */
    @Cron('0 10 * * 1', { timeZone: 'Asia/Kolkata' })
    weeklyTask() {
        const currentTime = TimezoneUtils.formatKolkataTime(new Date());
        console.log(`Weekly task executed at: ${currentTime}`);

        // Example: Weekly reports, database maintenance, etc.
        this.generateWeeklyReport();
    }

    /**
     * Run on the 1st day of every month at 8:00 AM IST
     */
    @Cron('0 8 1 * *', { timeZone: 'Asia/Kolkata' })
    monthlyTask() {
        const currentTime = TimezoneUtils.formatKolkataTime(new Date());
        console.log(`Monthly task executed at: ${currentTime}`);

        // Example: Monthly billing, archiving old data, etc.
    }

    /**
     * Using predefined cron expressions with timezone
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Kolkata' })
    midnightTask() {
        const currentTime = TimezoneUtils.formatKolkataTime(new Date());
        console.log(`Midnight task executed at: ${currentTime}`);

        // Example: Daily cleanup, log rotation, etc.
        this.performDailyCleanup();
    }

    private generateDailyReport() {
        const today = TimezoneUtils.getTodayRange();
        console.log('Generating daily report for:', {
            start: today.formatted.start,
            end: today.formatted.end
        });

        // Implement daily report generation logic
        // This could involve querying database for today's data
        // using the date range from TimezoneUtils
    }

    private generateWeeklyReport() {
        const thisWeek = TimezoneUtils.getThisWeekRange();
        console.log('Generating weekly report for:', {
            start: thisWeek.formatted.start,
            end: thisWeek.formatted.end
        });

        // Implement weekly report generation logic
    }

    private performDailyCleanup() {
        const now = TimezoneUtils.now();
        console.log('Performing daily cleanup at:', TimezoneUtils.formatKolkataTime(now));

        // Example cleanup tasks:
        // - Delete temporary files older than X days
        // - Archive old log files
        // - Clean up expired sessions
        // - Update cache or refresh data
    }

    /**
     * Manual trigger for testing scheduled tasks
     */
    triggerDailyReport() {
        console.log('Manually triggering daily report...');
        this.generateDailyReport();
        return {
            message: 'Daily report generation triggered',
            timestamp: TimezoneUtils.formatKolkataTime(new Date()),
            timestampISO: TimezoneUtils.getCurrentTimestamp()
        };
    }

    /**
     * Get next scheduled task times in IST
     */
    getScheduleInfo() {
        const now = TimezoneUtils.now();
        return {
            message: 'Scheduled tasks information',
            currentTime: TimezoneUtils.formatKolkataTime(now),
            timezone: 'Asia/Kolkata',
            scheduledTasks: [
                {
                    name: 'Daily Morning Task',
                    schedule: '9:00 AM IST daily',
                    cron: '0 9 * * *'
                },
                {
                    name: 'Hourly Task',
                    schedule: 'Every hour at minute 0',
                    cron: '0 * * * *'
                },
                {
                    name: 'Weekly Task',
                    schedule: '10:00 AM IST every Monday',
                    cron: '0 10 * * 1'
                },
                {
                    name: 'Monthly Task',
                    schedule: '8:00 AM IST on 1st day of month',
                    cron: '0 8 1 * *'
                },
                {
                    name: 'Midnight Task',
                    schedule: '12:00 AM IST daily',
                    cron: '0 0 * * *'
                }
            ]
        };
    }
}
