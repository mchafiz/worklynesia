import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserDto,
  PrismaService,
  UpdateUserDto,
} from '@worklynesia/common';
import type { UserProfile } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(UserService.name);

  // Find all users
  async findAll(): Promise<UserProfile[]> {
    return await this.prisma.userProfile.findMany({
      where: { deletedAt: null },
    });
  }

  // Find user by id
  async findById(id: string): Promise<UserProfile> {
    const userAuth = await this.prisma.userAuth.findUnique({
      where: { id },
    });

    if (!userAuth) throw new NotFoundException('User not found');
    const user = await this.prisma.userProfile.findUnique({
      where: { email: userAuth?.email, deletedAt: null },
    });

    console.log(user);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Find user by email
  async findByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.prisma.userProfile.findUnique({
      where: { email, deletedAt: null },
    });

    return user || null;
  }

  // Create user
  async create(data: CreateUserDto): Promise<UserProfile> {
    this.logger.log(`Creating user: ${JSON.stringify(data)}`);
    if (!data.email || !data.fullName) {
      throw new BadRequestException('Invalid data');
    }

    // check first if user already exists
    const user = await this.findByEmail(data.email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = await this.prisma.userProfile.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl ?? '',
        phoneNumber: data.phoneNumber ?? '',
      },
    });

    this.logger.log(`User oke ${JSON.stringify(createdUser)}`);

    return createdUser;
  }

  // Update user
  async update(id: string, data: UpdateUserDto): Promise<UserProfile> {
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
