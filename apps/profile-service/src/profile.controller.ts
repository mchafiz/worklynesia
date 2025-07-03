import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import type { UserProfile } from '@prisma/client';

type CreateUserDto = {
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  isActive?: boolean;
};

type UpdateUserDto = Partial<CreateUserDto>;

@Controller('users')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  findAll(): Promise<UserProfile[]> {
    return this.profileService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<UserProfile> {
    return this.profileService.findById(id);
  }

  @Post()
  create(@Body() userData: CreateUserDto): Promise<UserProfile> {
    return this.profileService.create(userData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<UserProfile> {
    return this.profileService.update(id, userData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.profileService.delete(id);
  }
}
