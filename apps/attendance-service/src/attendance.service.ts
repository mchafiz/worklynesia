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

  async getHistory(data: { userId: string; from?: string; to?: string }) {
    const auth = await this.prisma.userAuth.findUnique({
      where: { id: data.userId },
    });

    if (!auth) throw new Error('User not found');

    const profile = await this.prisma.userProfile.findUnique({
      where: { email: auth.email },
    });

    if (!profile) throw new Error('User not found');

    const now = new Date();

    const startDate = data.from
      ? new Date(data.from)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = data.to ? new Date(data.to) : now;

    return this.prisma.attendance.findMany({
      where: {
        userId: profile.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
