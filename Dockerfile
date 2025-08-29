# Use the official Node.js 20 bullseye image as the base for building
FROM node:20-bullseye AS base

# Set working directory
WORKDIR /app

# Install system dependencies required for lightningcss and native builds
RUN apt-get update && apt-get install -y \
    build-essential \
    libc6 \
    libstdc++6 \
    libgcc1 \
    zlib1g \
    python3 \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Update npm to the latest version
RUN npm install -g npm@11.4.2

# Copy npm configuration and dependencies
COPY .npmrc ./
COPY package*.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Rebuild native dependencies to ensure compatibility
RUN npm rebuild

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-bullseye AS production

WORKDIR /app

# Install system dependencies in production stage
RUN apt-get update && apt-get install -y \
    libc6 \
    libstdc++6 \
    libgcc1 \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

# Copy only the necessary files from the build stage
COPY --from=base /app/package*.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.ts ./
COPY --from=base /app/node_modules ./node_modules

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]