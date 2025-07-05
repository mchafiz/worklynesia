import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, LoggingInterceptor } from '@worklynesia/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        useFactory: () => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: ['localhost:9092'],
              clientId: 'user-service',
            },
            consumer: {
              groupId: 'user-service-consumer',
              allowAutoTopicCreation: true,
            },
            producer: {
              allowAutoTopicCreation: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    Logger,
    UserService,
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector, kafkaClient: any) => {
        return new LoggingInterceptor(reflector, kafkaClient);
      },
      inject: [Reflector, 'KAFKA_CLIENT'],
    },
  ],
})
export class UserModule {}
