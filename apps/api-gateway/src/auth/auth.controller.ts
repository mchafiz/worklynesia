import {
  Body,
  Controller,
  Logger,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import {
  AuthResponseDto,
  JwtAuthGuard,
  LoginDto,
  MessageResponseDto,
  RefreshTokenDto,
} from '@worklynesia/common';

import { jwtConfig } from '@worklynesia/common';
import { KafkaClientService } from 'src/shared/kafka/kafka-client.service';

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
}
