import { Controller } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MessagePattern } from '@nestjs/microservices';
import { AttendanceIn, AttendanceOut } from '@worklynesia/common';

@Controller()
export class AttendanceController {
  constructor(private readonly appService: AttendanceService) {}

  @MessagePattern('attendance.checkIn')
  async checkIn(data: AttendanceIn) {
    return this.appService.checkIn(data);
  }

  @MessagePattern('attendance.checkOut')
  async checkOut(data: AttendanceOut) {
    return this.appService.checkOut(data);
  }

  @MessagePattern('attendance.currentUserAttendance')
  async getCurrentUserAttendance(data: { userId: string }) {
    return this.appService.getCurrentUserAttendance(data);
  }

  @MessagePattern('attendance.history')
  async getHistory(data: { userId: string; from?: string; to?: string }) {
    return this.appService.getHistory(data);
  }
}
