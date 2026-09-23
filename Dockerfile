# ═══════════════════════════════════════════════
# Stage 1: Builder
# ═══════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for esbuild & tsc)
RUN npm install --legacy-peer-deps

# Copy source code and config
COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/

# Run typecheck and compile production bundle
RUN npm run build

# ═══════════════════════════════════════════════
# Stage 2: Production Runner
# ═══════════════════════════════════════════════
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/websec.db
ENV AUDIT_LOG_DIR=/app/data/audit-logs

# Install curl for docker healthcheck
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy built application and frontend assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create data directory for SQLite database and audit logs
RUN mkdir -p /app/data/audit-logs && chown -R node:node /app/data

# Switch to non-root user for security
USER node

# Expose web service port
EXPOSE 3000

# Health check to ensure service is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "dist/server.js"]
