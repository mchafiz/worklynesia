import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password for authentication',
  })
  password: string;

  @ApiProperty({
    example: true,
    description: 'Whether to remember the user session',
    required: false,
    default: false,
  })
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The refresh token to get new access token',
  })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information without sensitive data',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      fullName: 'John Doe',
      role: 'user',
    },
  })
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };

  @ApiProperty({
    description: 'JWT tokens for authentication',
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export class MessageResponseDto {
  @ApiProperty({
    example: 'Logged out successfully',
    description: 'Response message',
  })
  message: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address for registration',
  })
  email: string;

  @ApiProperty({
    example: 'securepassword123',
    description: 'Password for the account',
  })
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'User role (e.g., user, admin)',
    enum: UserRole,
    default: UserRole.user,
  })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: 'Whether to remember the user session',
    required: false,
    default: false,
  })
  rememberMe?: boolean;
}
