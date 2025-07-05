import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@worklynesia/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
              clientId: 'user-service', // bisa parametrisasi nanti
            },
            consumer: {
              groupId: 'user-service-consumer',
            },
          },
        }),
      },
    ]),
  ],
  controllers: [UserController],
  providers: [Logger, UserService],
})
export class UserModule {}
