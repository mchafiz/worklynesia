// notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  NotificationMessage,
  NotificationService,
} from './notification.service';
import { Server, Socket } from 'socket.io';

interface UpdateUserEvent {
  userId: string;
  changes: Record<string, any>;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private readonly userSockets: Map<string, Socket[]> = new Map();

  constructor(private readonly notificationService: NotificationService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, sockets] of this.userSockets.entries()) {
      const index = sockets.findIndex((s) => s.id === client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() { userId }: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(client);
    this.userSockets.set(userId, sockets);
    await client.join(`user_${userId}`);
    this.logger.log(`Client ${client.id} joined user_${userId}`);

    const notifications =
      this.notificationService.getNotificationsForUser(userId);
    client.emit('notifications', notifications);
  }

  @SubscribeMessage('getNotifications')
  handleGetNotifications(
    @MessageBody() { userId }: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!userId) {
      client.emit('error', { message: 'User ID is required' });
      return;
    }

    const notifications =
      this.notificationService.getNotificationsForUser(userId);
    client.emit('notifications', notifications);
  }

  @EventPattern('update.user')
  async handleUserUpdated(event: UpdateUserEvent) {
    const { userId, changes } = event;
    const notification: NotificationMessage = {
      id: `update_user_${userId}_${Date.now()}`,
      userId,
      title: 'User Updated',
      message: `Your profile has been updated`,
      timestamp: new Date(),
      metadata: changes,
    };

    try {
      await this.notificationService.storeNotification(userId, notification);
      this.sendNotificationToUser(userId, notification);
    } catch (error) {
      this.logger.error(
        `Failed to store notification for user ${userId}: ${notification.title}`,
        error,
      );
    }
  }

  private sendNotificationToUser(
    userId: string,
    notification: NotificationMessage,
  ) {
    this.server.to(`user_${userId}`).emit('notification', notification);
    this.logger.log(
      `Sent notification to user ${userId}: ${notification.title}`,
    );
  }
}
