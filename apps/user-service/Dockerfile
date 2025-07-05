# Base image
FROM node:18-alpine AS base
RUN apk add --no-cache curl netcat-openbsd
RUN npm install -g pnpm @nestjs/cli prisma
RUN pnpm config set auto-install-peers true
RUN pnpm config set strict-peer-dependencies false

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy workspace config files first for better caching
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./

# Copy packages and app package.json for dependency resolution
COPY packages/common/package.json ./packages/common/
COPY packages/typescript-config ./packages/typescript-config
COPY apps/profile-service/package.json ./apps/profile-service/
COPY prisma ./prisma

# Install all dependencies with cache
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Generate Prisma Client first
RUN pnpm prisma generate --schema=./prisma/schema.prisma

# Build common package
COPY packages/common ./packages/common
RUN cd packages/common && pnpm build

# Build the app
FROM deps AS builder
WORKDIR /app

# Copy app source
COPY apps/profile-service ./apps/profile-service

# Build the app
RUN cd apps/profile-service && pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

# Copy workspace files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy only necessary files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/apps/profile-service/dist ./apps/profile-service/dist
COPY --from=builder /app/apps/profile-service/package.json ./apps/profile-service/
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/
COPY --from=builder /app/packages/typescript-config ./packages/typescript-config

# Copy entrypoint script
COPY apps/profile-service/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Install production dependencies with cache
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    cd apps/profile-service && \
    pnpm install --prod --frozen-lockfile && \
    pnpm prisma generate --schema=../../prisma/schema.prisma

WORKDIR /app/apps/profile-service
EXPOSE 3002

ENTRYPOINT ["/entrypoint.sh"]
