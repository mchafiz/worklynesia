import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@worklynesia/common';
import type { UserProfile } from '@prisma/client';

type CreateUserInput = {
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  isActive?: boolean;
};

type UpdateUserInput = Partial<CreateUserInput>;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // Find all users
  async findAll(): Promise<UserProfile[]> {
    return await this.prisma.userProfile.findMany({
      where: { deletedAt: null },
    });
  }

  // Find user by id
  async findById(id: string): Promise<UserProfile> {
    const user = await this.prisma.userProfile.findUnique({
      where: { id, deletedAt: null },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Find user by email
  async findByEmail(email: string): Promise<UserProfile> {
    const user = await this.prisma.userProfile.findUnique({
      where: { email, deletedAt: null },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Create user
  async create(data: CreateUserInput): Promise<UserProfile> {
    return await this.prisma.userProfile.create({ data });
  }

  // Update user
  async update(id: string, data: UpdateUserInput): Promise<UserProfile> {
    const user = await this.prisma.userProfile.update({
      where: { id },
      data,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Soft delete user
  async delete(id: string): Promise<void> {
    await this.prisma.userProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
