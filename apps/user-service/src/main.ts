import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'user-service',
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'user-consumer',
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
