import { BadRequestException, Controller, Logger } from '@nestjs/common';
import type { UserProfile } from '@prisma/client';
import { UserService } from './user.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto, UpdateUserDto, Log } from '@worklynesia/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private readonly logger = new Logger(UserController.name);

  @MessagePattern('findAll.user')
  @Log({
    service: 'user-service',
    action: 'find-all-users',
    entityType: 'user',
  })
  findAll(): Promise<UserProfile[]> {
    return this.userService.findAll();
  }

  @MessagePattern('findById.user')
  @Log({
    service: 'user-service',
    action: 'find-user-by-id',
    entityType: 'user',
    entityId: (params: string) => params,
  })
  findById(id: string): Promise<UserProfile> {
    this.logger.log(`Finding user with id: ${id}`);
    return this.userService.findById(id);
  }

  @EventPattern('create.user')
  @Log({
    service: 'user-service',
    action: 'create-user',
    entityType: 'user',
    metadata: (data: CreateUserDto) => ({ email: data.email }),
  })
  async create(@Payload() userData: CreateUserDto): Promise<void> {
    this.logger.log(`Creating user: ${JSON.stringify(userData)}`);

    try {
      const user: UserProfile = await this.userService.create(userData);
      this.logger.log(`User created: ${user.email}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Skipping user: ${error.message}`);
      } else {
        this.logger.error(
          '❌ Failed to create user:',
          error instanceof Error ? error.message : String(error),
        );
      }
      // ⚠️ PENTING: JANGAN lempar error agar Kafka bisa commit offset
    }
  }

  @MessagePattern('update.user')
  @Log({
    service: 'user-service',
    action: 'update-user',
    entityType: 'user',
    entityId: (params: { id: string }) => params.id,
    metadata: (data: { user: UpdateUserDto }) => ({
      updatedFields: Object.keys(data.user),
    }),
  })
  update(data: { id: string; user: UpdateUserDto }): Promise<UserProfile> {
    this.logger.log(`Updating user ${data.id}`);
    return this.userService.update(data.id, data.user);
  }

  @MessagePattern('delete.user')
  @Log({
    service: 'user-service',
    action: 'delete-user',
    entityType: 'user',
    entityId: (params: string) => params,
  })
  delete(id: string): Promise<void> {
    this.logger.log(`Deleting user ${id}`);
    return this.userService.delete(id);
  }
}
