import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import {
  AuthResponseDto,
  CurrentUser,
  JwtAuthGuard,
  LoginDto,
  MessageResponseDto,
  RefreshTokenDto,
  RegisterDto,
} from '@worklynesia/common';

import { jwtConfig } from '@worklynesia/common';
import { KafkaClientService } from 'src/shared/kafka/kafka-client.service';
import { UserAuth } from '@prisma/client';

@ApiTags('Authentication API')
@Controller()
export class AuthController {
  constructor(private readonly kafkaClient: KafkaClientService) {}

  private readonly logger = new Logger(AuthController.name);

  setTokenCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
    rememberMe: boolean = false,
  ) {
    // Access token cookie (always set)
    response.cookie('accessToken', tokens.accessToken, {
      ...jwtConfig.cookie,
    });

    // Refresh token cookie (only set if rememberMe is true)
    if (rememberMe) {
      response.cookie('refreshToken', tokens.refreshToken, {
        ...jwtConfig.cookie,
      });
    }
  }

  clearTokenCookies(response: Response) {
    response.clearCookie('accessToken', jwtConfig.cookie);
    response.clearCookie('refreshToken', jwtConfig.cookie);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() credentials: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.kafkaClient.send<AuthResponseDto>(
        'login.user',
        credentials,
      );
      this.logger.log(`User ${credentials.email} logged in successfully`);

      this.setTokenCookies(
        response,
        {
          accessToken: result.tokens?.accessToken || '',
          refreshToken: result.tokens?.refreshToken || '',
        },
        credentials.rememberMe,
      );
      return result;
    } catch (error) {
      this.logger.error(`Login Failed: ${error}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('auth/refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 201,
    description: 'Tokens refreshed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.kafkaClient.send<MessageResponseDto>(
      'refresh.token',
      refreshTokenDto,
    );
    this.logger.log(`User ${result.message} refreshed tokens successfully`);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/verify')
  @ApiOperation({ summary: 'Verify authentication' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  verify(@CurrentUser() user: UserAuth) {
    return { user };
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged out',
    type: MessageResponseDto,
  })
  logout(@Res({ passthrough: true }) response: Response) {
    this.clearTokenCookies(response);
    return { message: 'Logged out successfully' };
  }

  @Post('auth/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration credentials',
    examples: {
      user: {
        summary: 'Regular User',
        value: {
          email: 'user@example.com',
          password: 'securepassword123',
          role: 'user',
        },
      },
      admin: {
        summary: 'Admin User',
        value: {
          email: 'admin@example.com',
          password: 'adminpassword123',
          role: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register(@Body() user: RegisterDto) {
    const result = await this.kafkaClient.send<AuthResponseDto>(
      'register.user',
      user,
    );
    this.logger.log(`User ${result.user.email} registered successfully`);

    return result;
  }
}
