import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  AuthResponse,
  jwtConfig,
  JwtPayloadUser,
  PrismaService,
  RegisterDto,
  SafeUser,
} from '@worklynesia/common';
import { UserAuth } from '@prisma/client';
@Injectable()
export class AuthService {
  private readonly refreshConfig = {
    secret: jwtConfig.refreshToken.secret,
    expiresIn: jwtConfig.refreshToken.expiresIn,
  };
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserAuth> {
    const user = await this.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
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
      const decoded = await this.jwtService.verifyAsync<JwtPayloadUser>(
        refreshToken,
        this.refreshConfig,
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

    const createdUser = await this.prisma.userAuth.create({
      data: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    const tokens = await this.generateTokens(createdUser);

    return {
      user: this.sanitizeUser(createdUser),
      tokens,
    };
  }

  private async generateTokens(
    user: UserAuth,
  ): Promise<AuthResponse['tokens']> {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshPayload = {
      sub: user.id,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),
      this.jwtService.signAsync(refreshPayload, this.refreshConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: UserAuth): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private async findUserByEmail(email: string): Promise<UserAuth | null> {
    return this.prisma.userAuth.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<UserAuth | null> {
    return this.prisma.userAuth.findUnique({ where: { id } });
  }
}
