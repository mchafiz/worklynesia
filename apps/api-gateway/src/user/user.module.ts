import { Logger, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { KafkaModule } from '../shared/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [UserController],
  providers: [UserService, Logger],
})
export class UserModule {}
