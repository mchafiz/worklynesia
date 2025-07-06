import { NestFactory } from '@nestjs/core';
import { AppModule } from './attendance.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'absensi-service',
          brokers: [process.env.KAFKA_BROKER || ''],
        },
        consumer: {
          groupId: 'absensi-consumer',
          allowAutoTopicCreation: true,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
