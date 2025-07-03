/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@worklynesia/common';
import { AuthResponse, JwtPayload, SafeUser } from './types/user.types';
import { jwtConfig } from './config/jwt.config';
import { UserAuth, UserRole } from '@prisma/client';
import { RegisterDto } from './dto/auth.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserAuth> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: UserAuth): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: jwtConfig.refreshToken.secret,
        },
      );

      const user = await this.findUserById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(user: RegisterDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const userResponse = await this.prisma.userAuth.create({
      data: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    const tokens = await this.generateTokens(userResponse);
    const { password: _, ...safeUser } = userResponse;

    return {
      user: safeUser,
      tokens,
    };
  }

  private async generateTokens(user: UserAuth) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: jwtConfig.accessToken.secret,
          expiresIn: jwtConfig.accessToken.expiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
        },
        {
          secret: jwtConfig.refreshToken.secret,
          expiresIn: jwtConfig.refreshToken.expiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: UserAuth): SafeUser {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private async findUserByEmail(email: string): Promise<UserAuth | null> {
    return this.prisma.userAuth.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<UserAuth | null> {
    return this.prisma.userAuth.findUnique({ where: { id } });
  }

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
}
