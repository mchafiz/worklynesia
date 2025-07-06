import {
  Body,
  Controller,
  Inject,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ClientKafkaProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import {
  CreateUserDto,
  LoginDto,
  PrismaService,
  RefreshTokenDto,
  RegisterDto,
} from '@worklynesia/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafkaProxy,
  ) {}

  private readonly logger = new Logger(AuthController.name);

  @MessagePattern('login.user')
  async login(@Body() credentials: LoginDto) {
    try {
      const { user, tokens } = await this.authService.login(
        await this.authService.validateUser(
          credentials.email,
          credentials.password,
        ),
      );

      this.logger.log(`User ${user.email} logged in successfully`);

      return { user, tokens };
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @MessagePattern('refresh.token')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokens = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
    );
    this.logger.log(`User refresh token`);
    return { tokens };
  }

  @MessagePattern('register.user')
  async register(@Body() user: RegisterDto) {
    const { user: registeredUser, tokens } =
      await this.authService.register(user);

    return { user: registeredUser, tokens };
  }

  @MessagePattern('change.password')
  async changePassword(data: {
    newPassword: string;
    currentPassword: string;
    userId: string;
  }) {
    this.logger.log(`User ${data.userId} attempting to change password`);

    // Get the full user data including password hash
    const user = await this.prisma.userAuth.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.authService.changePassword(
      user,
      data.newPassword,
      data.currentPassword,
    );

    return { success: true };
  }

  @EventPattern('create.user')
  async handleCreateUserFromUserProfile(@Payload() user: CreateUserDto) {
    this.logger.log(`Creating user auth: ${JSON.stringify(user)}`);

    try {
      await this.authService.register({
        ...user,
        role: user.role,
        password: 'p@sswordDefault',
      });

      this.logger.log(`✅ User created successfully: ${user.email}`);
    } catch {
      this.logger.error(`❌ Failed to create user ${user.email}`);

      // ⚠️ Penting: JANGAN throw error, cukup log saja!
      // return error secara diam-diam supaya Kafka bisa commit offset dan tidak retry
    }

    // Optional: return something hanya jika diperlukan oleh kamu, Kafka ignore return
  }
}
