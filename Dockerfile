# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time environment variables
ARG DATABASE_URL
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_SCHEMA
ARG JWT_SECRET
ARG NEXT_PUBLIC_APP_URL

ENV DATABASE_URL=$DATABASE_URL
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_NAME=$DB_NAME
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_SCHEMA=$DB_SCHEMA
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts for standalone mode
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverages output: 'standalone' from next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
