import { NestFactory } from '@nestjs/core';
import { ProfileModule } from './profile.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { join } from 'path';
// Load .env from root project
dotenv.config({
  path: join(__dirname, '../../../.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(ProfileModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  app.useLogger(app.get(Logger));
  await app.listen(process.env.PROFILE_SERVICE_PORT ?? 3000);
}
bootstrap();
