# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Set environment variable
ENV NODE_ENV=production

# Install docker-cli for legger-db-tool via docker.sock
RUN apk add --no-cache \
    bash \
    curl \
    docker-cli

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from stage 1
COPY --from=builder /app/dist ./dist

EXPOSE ${PORT:-3000}

# run the app
CMD ["npm", "run", "start:prod"]