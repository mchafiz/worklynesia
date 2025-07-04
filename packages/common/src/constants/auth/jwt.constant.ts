export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || "super-secret-access",
    expiresIn: "15m",
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || "super-secret-refresh",
    expiresIn: "7d",
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  },
};
