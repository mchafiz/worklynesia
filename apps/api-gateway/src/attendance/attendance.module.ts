import { Logger, Module } from '@nestjs/common';
import { KafkaModule } from '../shared/kafka/kafka.module';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [KafkaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, Logger],
})
export class AttendanceModule {}
