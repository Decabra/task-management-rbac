import 'reflect-metadata';
/**
 * RBAC API Server
 * Role-Based Access Control API with NestJS
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Global exception filter for consistent error handling
    app.useGlobalFilters(new HttpExceptionFilter());
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    // Security: Helmet - sets various HTTP headers for security
    app.use(helmet());

    // Security: CORS - allow requests from frontend
    const corsOrigin = process.env['CORS_ORIGIN'] || 'http://localhost:4200';
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    Logger.log(`🔒 CORS enabled for: ${corsOrigin}`);

    // Enable validation globally
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties
        transform: true, // Auto-transform payloads to DTO instances
        transformOptions: {
          enableImplicitConversion: true, // Enable type conversion
        },
      })
    );

    const port = process.env['PORT'] || 3000;
    await app.listen(port);
    Logger.log(`🚀 RBAC API Server is running on: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`🌐 API Base URL: http://localhost:${port}/${globalPrefix}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
