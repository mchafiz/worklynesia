import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ClientKafkaProxy,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { CreateUserDto, LoginDto, RefreshTokenDto } from '@worklynesia/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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

  @EventPattern('create.user')
  async register(@Body() user: CreateUserDto) {
    try {
      const { user: registeredUser } = await this.authService.register(user);

      return { user: registeredUser };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Skipping user: ${error.message}`);
      } else {
        this.logger.error(`❌ Failed to create user: ${error}`);
      }
      // ⚠️ PENTING: JANGAN lempar error agar Kafka bisa commit offset
    }
  }
}
