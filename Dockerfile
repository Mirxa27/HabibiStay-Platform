# HabibiStay Production Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    tini \
    curl \
    ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S habibistay -u 1001

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=habibistay:nodejs /app/dist ./dist
COPY --from=builder --chown=habibistay:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=habibistay:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs /app/temp && \
    chown -R habibistay:nodejs /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Switch to non-root user
USER habibistay

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server/index.js"]