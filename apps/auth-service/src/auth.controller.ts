import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { jwtConfig } from './config/jwt.config';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() credentials: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, tokens } = await this.authService.login(
      await this.authService.validateUser(
        credentials.email,
        credentials.password,
      ),
    );

    this.setTokenCookies(response, tokens);
    return { user };
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setTokenCookies(response, tokens);
    return { message: 'Tokens refreshed successfully' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    this.clearTokenCookies(response);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  getProfile() {
    // TODO: Implement get current user profile
    // This will be protected by JWT guard
    return { message: 'Protected route' };
  }

  private setTokenCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    response.cookie('accessToken', tokens.accessToken, {
      ...jwtConfig.cookie,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', tokens.refreshToken, {
      ...jwtConfig.cookie,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearTokenCookies(response: Response) {
    response.clearCookie('accessToken', jwtConfig.cookie);
    response.clearCookie('refreshToken', jwtConfig.cookie);
  }
}
