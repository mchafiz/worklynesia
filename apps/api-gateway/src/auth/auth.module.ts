import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KafkaModule } from '../shared/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [AuthController],
  providers: [AuthService, Logger],
})
export class AuthModule {}
