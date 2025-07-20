# Timezone Configuration Guide - Asia/Kolkata

This document explains the timezone configuration implemented in the NestJS application.

## Configuration Overview

The application is configured to use **Asia/Kolkata (IST - Indian Standard Time)** timezone.

### Changes Made:

1. **Environment Variable (.env)**

   ```bash
   TZ=Asia/Kolkata
   ```

2. **Application Startup (main.ts)**

   ```typescript
   process.env.TZ = 'Asia/Kolkata';
   ```

3. **Configuration File (configuration.ts)**
   ```typescript
   timezone: process.env.TZ || 'Asia/Kolkata';
   ```

## Timezone Utilities

### TimezoneUtils Class

A utility class provides various timezone-related functions:

```typescript
import { TimezoneUtils } from './utils/timezone.util';

// Get current time in IST
const now = TimezoneUtils.now();

// Format date in IST
const formatted = TimezoneUtils.formatKolkataTime(new Date());

// Convert any date to IST
const istDate = TimezoneUtils.toKolkataTime(new Date());

// Get timezone offset
const offset = TimezoneUtils.getTimezoneOffset(); // UTC+5:30
```

### Available Methods:

1. **`TimezoneUtils.now()`** - Get current date/time in IST
2. **`TimezoneUtils.formatKolkataTime(date, options?)`** - Format date in IST
3. **`TimezoneUtils.toKolkataTime(date)`** - Convert date to IST
4. **`TimezoneUtils.getTimezoneOffset()`** - Get IST offset string
5. **`TimezoneUtils.getCurrentTimestamp()`** - Get current timestamp for database
6. **`TimezoneUtils.toISTString(date?)`** - Convert date to IST ISO string

## API Endpoints

### Timezone Information Endpoint

```bash
GET /api/v1/timezone
```

Returns:

```json
{
  "message": "Timezone Information",
  "data": {
    "systemTimezone": "Asia/Kolkata",
    "currentTime": "2025-07-20T20:35:10.980Z",
    "kolkataTime": "21/07/2025, 02:05:10",
    "kolkataTimeISO": "2025-07-20T20:35:10.000Z",
    "isKolkataTimezone": false,
    "timezoneOffset": "UTC+5.5:30",
    "timestamp": "2025-07-20T20:35:10.000Z"
  }
}
```

## Usage Examples

### In Services

```typescript
import { TimezoneUtils } from '../utils/timezone.util';

@Injectable()
export class MyService {
  createRecord(data: any) {
    return {
      ...data,
      createdAt: TimezoneUtils.getCurrentTimestamp(),
      formattedTime: TimezoneUtils.formatKolkataTime(new Date()),
    };
  }
}
```

### Database Operations

For MySQL/TypeORM:

```typescript
@CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
})
createdAt: Date;
```

For MongoDB/Mongoose:

```typescript
{
  createdAt: {
    type: Date,
    default: () => TimezoneUtils.now()
  }
}
```

### Date Formatting in Responses

```typescript
// In controllers or services
const user = await this.userService.findById(id);
return {
  ...user,
  createdAtFormatted: TimezoneUtils.formatKolkataTime(user.createdAt),
  createdAtIST: TimezoneUtils.formatKolkataTime(user.createdAt, {
    dateStyle: 'full',
    timeStyle: 'short',
  }),
};
```

## Important Notes

1. **Database Storage**: Timestamps are still stored in UTC in the database, but displayed/processed in IST
2. **API Responses**: Consider formatting dates in IST for frontend consumption
3. **Logging**: Application logs now show IST timestamps
4. **Environment**: The timezone setting affects the entire Node.js process

## Testing Timezone

Use the following endpoints to verify timezone functionality:

```bash
# Check timezone info
curl -X GET "http://localhost:3000/api/v1/timezone"

# Create a record and check timestamps
curl -X POST http://localhost:3000/api/v1/post \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Test content", "userId": 1}'
```

## Common Use Cases

### 1. Daily Reports

```typescript
const today = TimezoneUtils.getTodayRange();
// Use today.start and today.end for database queries
```

### 2. Date Comparisons

```typescript
const istNow = TimezoneUtils.now();
const isToday =
  TimezoneUtils.formatKolkataTime(someDate, { dateStyle: 'short' }) ===
  TimezoneUtils.formatKolkataTime(istNow, { dateStyle: 'short' });
```

### 3. Scheduled Tasks

```typescript
// For cron jobs that should run at IST times
@Cron('0 9 * * *', { timeZone: 'Asia/Kolkata' })
dailyReport() {
    // This runs at 9:00 AM IST
}
```

This configuration ensures consistent timezone handling across your entire NestJS application.
