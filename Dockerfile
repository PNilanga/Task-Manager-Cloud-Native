# ============================================
# Stage 1: Install dependencies
# ============================================
# We use a "multi-stage" build. This first stage installs everything,
# but we only copy what we need into the final image.
# This keeps the final image small and secure.
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker caches layers — if these files
# haven't changed, Docker skips the npm install step on rebuilds!)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# ============================================
# Stage 2: Production image
# ============================================
FROM node:18-alpine

# Security: Don't run as root in production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the production node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port (documentation for other developers)
EXPOSE 3000

# Switch to non-root user
USER appuser

# Health check — Docker/K8s will use this to know if the app is alive
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
