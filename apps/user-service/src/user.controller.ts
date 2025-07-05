import { BadRequestException, Controller, Logger } from '@nestjs/common';
import type { UserProfile } from '@prisma/client';
import { UserService } from './user.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto, UpdateUserDto } from '@worklynesia/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private readonly logger = new Logger(UserController.name);

  @MessagePattern('findAll.user')
  findAll(): Promise<UserProfile[]> {
    return this.userService.findAll();
  }

  @MessagePattern('findById.user')
  findById(id: string): Promise<UserProfile> {
    this.logger.log(`Finding user with id: ${id}`);
    return this.userService.findById(id);
  }

  @EventPattern('create.user')
  async create(@Payload() userData: CreateUserDto): Promise<void> {
    this.logger.log(`Creating user: ${JSON.stringify(userData)}`);

    try {
      const user = await this.userService.create(userData);
      this.logger.log(`User created: ${user.email}`);
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Skipping user: ${error.message}`);
      } else {
        this.logger.error(`❌ Failed to create user: ${error}`);
      }
      // ⚠️ PENTING: JANGAN lempar error agar Kafka bisa commit offset
    }
  }

  @MessagePattern('update.user')
  update(data: { id: string; user: UpdateUserDto }): Promise<UserProfile> {
    this.logger.log(`Updating user ${data.id}`);
    return this.userService.update(data.id, data.user);
  }

  @MessagePattern('delete.user')
  delete(id: string): Promise<void> {
    this.logger.log(`Deleting user ${id}`);
    return this.userService.delete(id);
  }
}
