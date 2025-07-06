import { BadRequestException, Controller, Logger } from '@nestjs/common';
import type { UserProfile } from '@prisma/client';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
  async findById(id: string): Promise<UserProfile> {
    this.logger.log(`Finding user with id: ${id}`);

    try {
      const user: UserProfile = await this.userService.findById(id);
      this.logger.log(`User found: ${user.email}`);
      return user;
    } catch {
      this.logger.error(`Failed to find user with id: ${id}`);
      throw new BadRequestException('User not found');
    }
  }

  @MessagePattern('create.user')
  @Log({
    service: 'user-service',
    action: 'create-user',
    entityType: 'user',
    metadata: () => {
      return 'create user action';
    },
  })
  async create(@Payload() userData: CreateUserDto): Promise<UserProfile> {
    this.logger.log(`Creating user: ${JSON.stringify(userData)}`);
    const user: UserProfile = await this.userService.create(userData);

    return user;
  }

  @MessagePattern('update.user')
  @Log({
    service: 'user-service',
    action: 'update-user',
    entityType: 'user',
    entityId: (data: { id: string; user: UpdateUserDto }) => data.id,
    metadata: (data: { id: string; user: UpdateUserDto }) => ({
      updatedFields: data.user ? Object.keys(data.user) : [],
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
