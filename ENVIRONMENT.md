# Environment Configuration

This project uses environment variables for configuration. Follow these steps to set up your environment:

## Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual configuration values.

## Environment Variables

### Required Variables

- `NODE_ENV`: Application environment (development, production, test)
- `PORT`: Port number for the server (default: 3000)
- `MONGODB_URI`: MongoDB connection URI
- `MONGODB_DATABASE_NAME`: MongoDB database name

### Optional Variables

- `API_PREFIX`: Global API prefix (default: api/v1)
- `CORS_ORIGIN`: Comma-separated list of allowed origins
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time
- `RATE_LIMIT_TTL`: Rate limiting time window in seconds
- `RATE_LIMIT_LIMIT`: Maximum requests per time window
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `BCRYPT_SALT_ROUNDS`: Number of salt rounds for bcrypt hashing

### Database Configuration

```bash
MONGODB_URI=mongodb://localhost:27017/nest-app
MONGODB_DATABASE_NAME=nest-app
```

### Development vs Production

- Development: Uses `.env` file
- Production: Use environment variables directly (don't commit `.env` to version control)

## Configuration Structure

The application uses a structured configuration system:

- `src/config/configuration.ts`: Main configuration factory
- `src/config/env.validation.ts`: Environment variable validation
- `.env`: Environment variables (not committed to git)
- `.env.example`: Example environment file (committed to git)

## Validation

The application validates required environment variables at startup. If any required variables are missing or invalid, the application will fail to start with a descriptive error message.

## Usage in Code

```typescript
import { ConfigService } from '@nestjs/config';

// Inject ConfigService
constructor(private configService: ConfigService) {}

// Get configuration values
const port = this.configService.get<number>('port');
const dbUri = this.configService.get<string>('database.uri');
const jwtSecret = this.configService.get<string>('jwt.secret');
```
