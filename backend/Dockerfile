# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies (including devDependencies if needed for build)
RUN npm ci

COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Set node env
ENV NODE_ENV production

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy app source from builder
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/server.js ./server.js

# Ensure logs directory exists with proper permissions
RUN mkdir -p logs && chown -R node:node /usr/src/app/logs

USER node

EXPOSE 5000

CMD ["node", "server.js"]
