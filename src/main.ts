import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { CustomValidationPipe } from './utils/custom-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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

  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
}
bootstrap();
