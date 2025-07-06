# Base image
FROM node:18-alpine AS base
RUN apk add --no-cache curl netcat-openbsd
RUN npm install -g pnpm@9.15.4
RUN pnpm config set auto-install-peers true
RUN pnpm config set strict-peer-dependencies false

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy workspace config files first for better caching
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy prisma schema
COPY prisma/schema.prisma ./prisma/schema.prisma

# Install all dependencies with cache
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Generate Prisma Client first
RUN pnpm prisma generate --schema=./prisma/schema.prisma

# Copy typescript config files
COPY packages/typescript-config ./packages/typescript-config

# Copy common package files
COPY packages/common/package.json ./packages/common/
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/common/src ./packages/common/src

# Install common package dependencies and build
RUN cd packages/common && \
    pnpm install && \
    pnpm build



# Generate Prisma Client
RUN pnpm prisma generate --schema=./prisma/schema.prisma

# Build the app
FROM deps AS builder
WORKDIR /app

# Copy app source
COPY apps/attendance-service ./apps/attendance-service

# Build the app
RUN cd apps/attendance-service && pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

# Create necessary directories
RUN mkdir -p /app/packages/common/dist /app/apps/attendance-service/dist /app/prisma

# Copy only necessary files from builder
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/packages/common/dist /app/packages/common/dist
COPY --from=builder /app/packages/common/package.json /app/packages/common/package.json
COPY --from=builder /app/apps/attendance-service/dist /app/apps/attendance-service/dist
COPY --from=builder /app/apps/attendance-service/package.json /app/apps/attendance-service/package.json
COPY --from=builder /app/packages/typescript-config /app/packages/typescript-config
COPY --from=builder /app/prisma/schema.prisma /app/prisma/schema.prisma

# Install production dependencies
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    cd apps/attendance-service && \
    pnpm install --prod --frozen-lockfile && \
    pnpm prisma generate --schema=../../prisma/schema.prisma

# Set working directory
WORKDIR /app/apps/attendance-service

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3004/health || exit 1

# Run the application
CMD ["node", "dist/main"]