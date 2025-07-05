import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { PrismaService } from '@worklynesia/common';

export interface NotificationMessage {
  id?: string;
  userId: string;
  title: string;
  message: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Simpan notifikasi ke DB
  async storeNotification(
    userId: string,
    notification: NotificationMessage,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp || new Date(),
        metadata: notification.metadata ?? {},
      },
    });

    this.logger.log(
      `Stored notification for user ${userId}: ${notification.title}`,
    );
  }

  // Ambil semua notifikasi user
  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
