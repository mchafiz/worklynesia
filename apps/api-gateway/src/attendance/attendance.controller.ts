import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Attendance, AttendanceStatus } from '@prisma/client';
import {
  AttendanceIn,
  AttendanceOut,
  CurrentUser,
  JwtAuthGuard,
  JwtPayload,
} from '@worklynesia/common';

import { KafkaClientService } from 'src/shared/kafka/kafka-client.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Attendance API')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly kafkaClient: KafkaClientService) {}

  private readonly logger = new Logger(AttendanceController.name);
  @Get('history')
  @ApiOperation({ summary: 'Get attendance history by date range' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date in YYYY-MM-DD format (default: start of month)',
    example: '2025-07-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date in YYYY-MM-DD format (default: today)',
    example: '2025-07-05',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async findHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: { from?: string; to?: string },
  ) {
    const result = await this.kafkaClient.send<Attendance[]>(
      'attendance.history',
      {
        userId: user.sub,
        from: query.from,
        to: query.to,
      },
    );

    return result;
  }

  @Post('checkin')
  @ApiOperation({ summary: 'Checkin' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['locationIn', 'locationInLat', 'locationInLng', 'status'],
      properties: {
        locationIn: { type: 'string', example: 'Jalan. sirsak rt 001 rw 001' },
        locationInLat: { type: 'number', example: '...' },
        locationInLng: { type: 'number', example: '....' },
        status: { type: 'string', example: AttendanceStatus },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Checkin successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async checkin(@Body() body: AttendanceIn, @CurrentUser() user: JwtPayload) {
    try {
      const result = await this.kafkaClient.send<Attendance>(
        'attendance.checkIn',
        {
          ...body,
          userId: user.sub,
        },
      );
      this.logger.log(`User ${JSON.stringify(user)} checked in successfully`);

      return result;
    } catch (error) {
      this.logger.error(`Checkin Failed: ${error}`);
      throw new BadRequestException('Sudah check-in hari ini');
    }
  }

  @Get('currentUserAttendance')
  @ApiOperation({ summary: 'Get current user attendance' })
  @ApiResponse({ status: 200, description: 'Attendance found' })
  @ApiResponse({ status: 404, description: 'Attendance not found' })
  async getCurrentUserAttendance(@CurrentUser() user: JwtPayload) {
    try {
      const result = await this.kafkaClient.send<Attendance>(
        'attendance.currentUserAttendance',
        {
          userId: user.sub,
        },
      );
      this.logger.log(`User ${JSON.stringify(user)} already checked in`);

      return result;
    } catch {
      throw new BadRequestException('Belum ada  check-in hari ini');
    }
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['locationOut', 'locationOutLat', 'locationOutLng', 'status'],
      properties: {
        locationOut: { type: 'string', example: 'Jalan. sirsak rt 001 rw 001' },
        locationOutLat: { type: 'number', example: '-6.215262' },
        locationOutLng: { type: 'number', example: '106.826598' },
        status: { type: 'string', example: 'wfh' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Checkout successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async checkout(@Body() body: AttendanceOut, @CurrentUser() user: JwtPayload) {
    const result = await this.kafkaClient.send<Attendance>(
      'attendance.checkOut',
      {
        ...body,
        userId: user.sub,
      },
    );
    this.logger.log(`User ${JSON.stringify(user)} checked out successfully`);

    return result;
  }
}
