import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// Load .env from root project
dotenv.config({
  path: join(__dirname, '../../../.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  app.useLogger(app.get(Logger));
  // set logger
  app.setGlobalPrefix('api');

  // const logger = new Logger('AuthService');

  // Enable CORS with credentials
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  });

  // Enable cookie parsing
  app.use(cookieParser());

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription(
      'Authentication and authorization service API documentation',
    )
    .setVersion('1.0')
    .addTag('Authentication')
    .addCookieAuth('accessToken')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.AUTH_SERVICE_PORT ?? 3000);
}
bootstrap();
