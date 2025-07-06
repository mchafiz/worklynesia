import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AttendanceIn,
  AttendanceOut,
  PrismaService,
} from '@worklynesia/common';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(AttendanceService.name);

  async checkIn(data: AttendanceIn) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const auth = await this.prisma.userAuth.findUnique({
      where: { id: data.userId },
    });

    this.logger.log(`User ${JSON.stringify(auth)} auth`);

    if (!auth) {
      throw new Error('User not found');
    }
    const profile = await this.prisma.userProfile.findUnique({
      where: { email: auth.email },
    });

    this.logger.log(`User ${JSON.stringify(profile)} profile`);

    if (!profile) {
      throw new Error('User not found');
    }

    // Cek apakah user sudah check-in hari ini
    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId: profile.id,
        date: today,
      },
    });

    if (existing) {
      throw new Error('Sudah check-in hari ini');
    }

    return this.prisma.attendance.create({
      data: {
        userId: profile.id,
        date: today,
        checkInAt: new Date(),
        locationIn: data.locationIn,
        locationInLat: data.locationInLat,
        locationInLng: data.locationInLng,
        status: data.status,
      },
    });
  }

  async checkOut(data: AttendanceOut) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const auth = await this.prisma.userAuth.findUnique({
      where: { id: data.userId },
    });

    if (!auth) {
      throw new Error('User not found');
    }
    const profile = await this.prisma.userProfile.findUnique({
      where: { email: auth.email },
    });

    if (!profile) {
      throw new Error('User not found');
    }

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId: profile.id,
        date: today,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Belum check-in hari ini');
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutAt: new Date(),
        locationOut: data.locationOut,
        locationOutLat: data.locationOutLat,
        locationOutLng: data.locationOutLng,
      },
    });
  }

  async getCurrentUserAttendance(data: { userId: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const auth = await this.prisma.userAuth.findUnique({
      where: { id: data.userId },
    });

    if (!auth) throw new Error('User not found');

    const profile = await this.prisma.userProfile.findUnique({
      where: { email: auth.email },
    });

    if (!profile) throw new Error('User not found');

    this.logger.log(`User ${JSON.stringify(profile)} profile`);

    // Only return attendance if user hasn't checked out yet
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId: profile.id,
        date: today,
        checkOutAt: null, // Only return if not checked out
      },
    });

    this.logger.log(`User ${JSON.stringify(attendance)} attendance`);

    if (!attendance) {
      throw new NotFoundException(
        'No active attendance record found for today',
      );
    }

    return attendance;
  }

  async getHistory(data: { userId: string; from?: string; to?: string }) {
    const auth = await this.prisma.userAuth.findUnique({
      where: { id: data.userId },
    });

    if (!auth) throw new Error('User not found');

    const profile = await this.prisma.userProfile.findUnique({
      where: { email: auth.email },
    });

    if (!profile) throw new Error('User not found');

    const startDate = data.from
      ? new Date(data.from)
      : new Date(new Date().setDate(1));
    const endDate = data.to ? new Date(data.to) : new Date();

    // Set time to start of day (00:00:00) in local timezone
    startDate.setUTCHours(0, 0, 0, 0);
    // Set time to end of day (23:59:59.999) in local timezone
    endDate.setUTCHours(23, 59, 59, 999);

    // Define the where clause type
    interface WhereClause {
      userId?: string;
      OR: Array<{
        checkInAt?: { gte?: Date; lte?: Date };
        checkOutAt?: { gte?: Date; lte?: Date; equals?: null };
      }>;
    }

    // Initialize the where clause with proper typing
    const whereClause: WhereClause = {
      OR: [
        // Check if checkIn is within the date range
        {
          checkInAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        // Check if checkOut is within the date range
        {
          checkOutAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        // Check if the attendance period completely contains the date range
        {
          checkInAt: { lte: startDate },
          checkOutAt: { gte: endDate },
        },
        // Include records where checkIn is before or on endDate and checkOut is null
        {
          checkInAt: { lte: endDate },
          checkOutAt: { equals: null },
        },
      ],
    };

    // Only add userId filter if the user is not an admin
    if (auth.role !== 'admin') {
      whereClause.userId = profile.id;
    }

    return this.prisma.attendance.findMany({
      where: whereClause,
      orderBy: { checkInAt: 'desc' },
    });
  }
}
