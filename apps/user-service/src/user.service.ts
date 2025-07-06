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
import type { UserAuth, UserProfile } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(UserService.name);

  // Find all users
  async findAll(): Promise<UserProfile[]> {
    const userAuthList = await this.prisma.userAuth.findMany({
      where: { deletedAt: null },
    });

    const userProfiles = await this.prisma.userProfile.findMany({
      where: {
        email: { in: userAuthList.map((user) => user.email) },
        deletedAt: null,
      },
    });

    const userCombine = userProfiles.map((user) => {
      const auth = userAuthList.find(
        (auth) => auth.email === user.email,
      ) as UserAuth;

      return {
        ...user,
        role: auth?.role,
      };
    });

    return userCombine;
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
  async update(id: string, userData: UpdateUserDto): Promise<UserProfile> {
    this.logger.log(`Updating user ${id} ${userData.fullName}`);
    const userAuth = await this.prisma.userAuth.findUnique({
      where: { id },
    });
    if (!userAuth) throw new NotFoundException('User not found');
    const user = await this.prisma.userProfile.update({
      where: { email: userAuth?.email, deletedAt: null },
      data: {
        fullName: userData.fullName,
        avatarUrl: userData.avatarUrl ?? '',
        phoneNumber: userData.phoneNumber ?? '',
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Soft delete user
  async delete(id: string): Promise<void> {
    const userAuth = await this.prisma.userAuth.findUnique({
      where: { id },
    });
    if (!userAuth) throw new NotFoundException('User not found');
    await this.prisma.userProfile.update({
      where: { email: userAuth?.email, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
