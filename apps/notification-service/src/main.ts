import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  await app.listen(3003); // Port WebSocket
  console.log('🔌 WebSocket Gateway is available at: ws://localhost:3003');
}

bootstrap();
