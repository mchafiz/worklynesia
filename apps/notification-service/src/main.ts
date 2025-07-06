import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  await app.listen(process.env.NOTIFICATION_SERVICE_PORT || 3005); // Port WebSocket
  console.log(
    '🔌 WebSocket Gateway is available at: ws://localhost:' +
      process.env.NOTIFICATION_SERVICE_PORT,
  );
}

bootstrap();
