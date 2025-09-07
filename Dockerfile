# =============================================================================
# MCP ABAP ADT Server - Modern Multi-stage Dockerfile
# =============================================================================
# Updated: September 2025
# - Node.js 22 LTS (latest stable)
# - Modern TypeScript build with ES2022 target
# - Security-hardened runtime with non-root user
# - Optimized caching layers and small final image
# - Health check for container orchestration
# =============================================================================

# -----------------------
# Builder stage
# -----------------------
FROM node:22-alpine AS builder

# Install security updates and dumb-init for proper signal handling
RUN apk add --no-cache dumb-init && \
    apk upgrade --no-cache

WORKDIR /app

# Copy package files for dependency installation (better caching)
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for building)
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
        npm ci --include=dev --prefer-offline --no-audit --progress=false; \
    else \
        npm install --include=dev --prefer-offline --no-audit --progress=false; \
    fi

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY index.ts ./
COPY src/ ./src/

# Build the TypeScript application
RUN npm run build

# Run tests to ensure build quality (optional but recommended)
RUN npm test

# -----------------------
# Production runtime stage
# -----------------------
FROM node:22-alpine AS runtime

# Install security updates and dumb-init
RUN apk add --no-cache dumb-init && \
    apk upgrade --no-cache

# Create non-root user for security
ARG APP_USER=mcpabap
ARG APP_UID=1001
ARG APP_GID=1001

RUN addgroup -g $APP_GID -S $APP_USER && \
    adduser -u $APP_UID -S -G $APP_USER -h /app -s /bin/sh $APP_USER

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=512" \
    PORT=6969 \
    TLS_REJECT_UNAUTHORIZED=0

# Copy package files and install only production dependencies
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
        npm ci --omit=dev --prefer-offline --no-audit --progress=false; \
    else \
        npm install --omit=dev --prefer-offline --no-audit --progress=false; \
    fi && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=$APP_USER:$APP_USER /app/dist ./dist

# Copy example environment file for reference
COPY --chown=$APP_USER:$APP_USER .env.example ./

# Switch to non-root user
USER $APP_USER

# Expose port
EXPOSE $PORT

# Add healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD node -e "const http=require('http');const options={hostname:'localhost',port:process.env.PORT||6969,path:'/',method:'HEAD',timeout:5000};const req=http.request(options,res=>{process.exit(res.statusCode<400?0:1)});req.on('error',()=>process.exit(1));req.on('timeout',()=>process.exit(1));req.end();"

# Use dumb-init to handle signals properly in containers
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP ABAP ADT server
CMD ["node", "dist/index.js"]
