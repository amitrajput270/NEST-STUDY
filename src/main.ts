import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { CustomValidationPipe } from './utils/validations/custom-validation.pipe';
import { FileLogger } from './utils/logger/file-logger';
import * as express from 'express';

async function bootstrap() {
  const fileLogger = FileLogger.getInstance();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // trust proxy to get x-forwarded-for IP correctly
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // Custom JSON body parser with error handling
  app.use('/api/v1', express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
    limit: '10mb'
  }), (error: any, req: any, res: any, next: any) => {
    if (error instanceof SyntaxError && 'body' in error) {
      // Log to both console and file
      fileLogger.logJSONParseError(error, {
        url: req.url,
        method: req.method,
        rawBody: req.rawBody?.toString(),
        headers: req.headers
      });

      return res.status(400).json({
        statusCode: 400,
        message: 'Bad Request',
        data: null,
        errors: error.message,
        trace: {
          file: 'express-json-parser',
          line: '0',
          column: '0'
        }
      });
    }
    next();
  });

  // Global validation pipe with custom error formatting
  app.useGlobalPipes(new CustomValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: false,
  }));

  // Global response interceptor (for success responses)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filter (for error responses)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS
  app.enableCors({
    origin: configService.get<string[]>('cors.origin'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Set global prefix
  const apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  // Log startup information
  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  fileLogger.logInfo('Application started', {
    port,
    apiPrefix,
    environment: process.env.NODE_ENV || 'development',
    dbType: process.env.DB_TYPE || 'mongodb',
    ipAddress: expressApp.get('trust proxy') ? expressApp.get('x-forwarded-for') || 'unknown' : 'localhost'
  });
}
bootstrap();
