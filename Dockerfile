# Multi-stage build for Canvasmatic Render Service

# --- Stage 1: Builder ---
# This stage installs all dependencies, including devDependencies, and builds the TypeScript source.
FROM node:20-slim AS builder

# Install system dependencies required for node-canvas (a fabric dependency)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files and install all dependencies from lock file
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project
RUN npm run build

# --- Stage 2: Production ---
# This stage creates the final, lean image for running the application.
FROM node:20-slim AS production

# Install only the runtime system dependencies for node-canvas
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package.json to manage dependencies
COPY package*.json ./

# Copy only production node_modules from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the compiled application code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# It's best practice to run the container as a non-root user
RUN groupadd --system appuser && useradd --system --gid appuser appuser
USER appuser

# Expose the port the app will run on
# Note: The PORT env var can override this (e.g., Cloud Run sets it automatically)
EXPOSE 8081

# Healthcheck to ensure the service is running correctly
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

# The command to start the application
# This will execute `node dist/index.js` as defined in package.json
CMD [ "npm", "start" ]
