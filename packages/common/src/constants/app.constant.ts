export const APP_CONFIG = {
  JWT: {
    SECRET: "contoh",
    EXPIRES_IN: "1d",
  },
  CACHE: {
    TTL: 30,
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  },
} as const;
