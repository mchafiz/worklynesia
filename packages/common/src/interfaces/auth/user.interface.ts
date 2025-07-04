import { UserAuth } from "@prisma/client";

export type SafeUser = Omit<UserAuth, "password">;

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  tokens: Tokens;
}

export interface JwtPayloadUser {
  sub: string;
  email: string;
  role: string;
}
