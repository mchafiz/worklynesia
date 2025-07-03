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
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  AuthResponseDto,
  LoginDto,
  MessageResponseDto,
  RefreshTokenDto,
  RegisterDto,
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  @Post('login')
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
    const { user, tokens } = await this.authService.login(
      await this.authService.validateUser(
        credentials.email,
        credentials.password,
      ),
    );

    this.authService.setTokenCookies(response, tokens, credentials.rememberMe);
    return { user };
  }

  @Post('refresh')
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
    if (!refreshTokenDto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokens = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
    );
    this.authService.setTokenCookies(response, tokens);
    return { message: 'Tokens refreshed successfully' };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged out',
    type: MessageResponseDto,
  })
  logout(@Res({ passthrough: true }) response: Response) {
    this.authService.clearTokenCookies(response);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() request: Request & { user: { sub: string } }) {
    const user = await this.authService.findUserById(request.user.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user;
    return { user: safeUser };
  }

  @Post('register')
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
  async register(
    @Body() user: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user: registeredUser, tokens } =
      await this.authService.register(user);
    this.authService.setTokenCookies(response, tokens, user.rememberMe);
    return { user: registeredUser };
  }
}
