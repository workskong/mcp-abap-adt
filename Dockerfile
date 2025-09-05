## Updated Dockerfile
## - Modern multistage build for a TypeScript Node.js app
## - Node 20 LTS, build cache friendly, non-root runtime, small final image

# -----------------------
# Builder stage
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies first (cacheable). Use package-lock when available.
COPY package.json package-lock.json* ./
# Use npm ci when lockfile exists for reproducible installs; otherwise fall back to npm install.
RUN if [ -f package-lock.json ]; then \
			npm ci --prefer-offline --no-audit --progress=false; \
		else \
			npm install --prefer-offline --no-audit --progress=false; \
		fi

# Copy source and build
COPY . .
RUN npm run build --if-present

# -----------------------
# Runtime stage
# -----------------------
FROM node:20-alpine AS runner

# Use a non-root user for security
ARG APP_USER=app
ARG APP_UID=1000

WORKDIR /app

# Production environment
ENV NODE_ENV=production

# Copy only what we need for runtime to keep the image small
COPY package.json package-lock.json* ./
# Use npm ci when lockfile exists; otherwise npm install and prune dev deps
RUN if [ -f package-lock.json ]; then \
			npm ci --omit=dev --prefer-offline --no-audit --progress=false; \
		else \
			npm install --omit=dev --prefer-offline --no-audit --progress=false; \
		fi \
		&& addgroup -S $APP_USER \
		&& adduser -S -G $APP_USER -u $APP_UID $APP_USER

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# If you rely on runtime env files, copy them explicitly (optional)
# COPY .env.production .env

# Ensure the non-root user owns the app directory
RUN chown -R $APP_USER:$APP_USER /app
USER $APP_USER

# Runtime port (matches project convention)
ENV PORT=6969
EXPOSE 6969

# Healthcheck implemented with Node (no extra packages required)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD ["node","-e","const http=require('http'); const p=process.env.PORT||6969; const req=http.request({host:'127.0.0.1',port:p,path:'/health',method:'GET'},res=>{if(res.statusCode>=200&&res.statusCode<400)process.exit(0);process.exit(1)}); req.on('error',()=>process.exit(1)); req.end()"]

# Start the app with source-map support for better stack traces
CMD ["node","--enable-source-maps","dist/index.js"]
