import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import {
  AuthResponseDto,
  CurrentUser,
  JwtAuthGuard,
  JwtPayload,
  LoginDto,
  MessageResponseDto,
  RefreshTokenDto,
  RegisterDto,
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
  @Post('auth/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 201,
    description: 'Password changed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Body()
    passwordData: {
      newPassword: string;
      currentPassword: string;
    },
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      this.logger.log(
        `Change password request received. User object: ${JSON.stringify(user)}`,
      );

      const userId = user.sub;

      if (!userId) {
        this.logger.error('No user ID found in request. User object:', user);
        throw new UnauthorizedException('User not properly authenticated');
      }

      await this.kafkaClient.send<MessageResponseDto>('change.password', {
        newPassword: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
        userId: userId,
      });

      this.clearTokenCookies(response);
      this.logger.log(
        `Password change initiated for user: ${user.email || 'unknown'}`,
      );
      return { message: 'Password change request received' };
    } catch (error) {
      this.logger.error('Change Password Failed:', error);
      throw new UnauthorizedException('Failed to process password change');
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
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.kafkaClient.send<MessageResponseDto>(
        'refresh.token',
        refreshTokenDto,
      );
      this.logger.log(`User ${result.message} refreshed tokens successfully`);
      return result;
    } catch (error) {
      this.clearTokenCookies(response);
      this.logger.error(`Refresh Failed: ${error}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/verify')
  @ApiOperation({ summary: 'Verify authentication' })
  @ApiResponse({ status: 200, description: 'User is authenticated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  verify(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    try {
      return { user };
    } catch {
      const refreshToken = request.cookies?.refreshToken as string;

      if (!refreshToken) {
        this.clearTokenCookies(response);
      }

      throw new UnauthorizedException(
        refreshToken
          ? 'Session expired. Refreshing token...'
          : 'Session expired. Please login again.',
      );
    }
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
