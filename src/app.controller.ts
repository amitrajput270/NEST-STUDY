import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TimezoneUtils } from './utils/timezone.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  createHello(): string {
    return 'Hello Created!';
  }

  @Get('timezone')
  getTimezone() {
    return {
      message: 'Timezone Information',
      data: {
        systemTimezone: process.env.TZ || 'System default',
        currentTime: new Date().toISOString(),
        kolkataTime: TimezoneUtils.formatKolkataTime(new Date()),
        kolkataTimeISO: TimezoneUtils.toISTString(),
        isKolkataTimezone: TimezoneUtils.isKolkataTimezone(),
        timezoneOffset: TimezoneUtils.getTimezoneOffset(),
        timestamp: TimezoneUtils.getCurrentTimestamp()
      }
    };
  }

  @Get('timezone/ranges')
  getTimezoneRanges() {
    return {
      message: 'Date ranges in IST timezone',
      data: {
        today: TimezoneUtils.getTodayRange(),
        thisWeek: TimezoneUtils.getThisWeekRange(),
        currentTime: TimezoneUtils.formatKolkataTime(new Date()),
        logFormat: TimezoneUtils.formatForLogs(new Date()),
        timezone: 'Asia/Kolkata'
      }
    };
  }
}
