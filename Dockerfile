# Base image
FROM ubuntu

# Update Ubuntu and install curl
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get install -y --fix-missing

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install PM2 globally
RUN npm install -g pm2

# Install libvips and its dependencies
RUN apt-get install -y \
    libvips \
    libvips-dev \
    pkg-config \
    build-essential \
    python2 \
    libcairo2-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpng-dev

# Set working directory
WORKDIR /rms-backend

# Copy application files
COPY package.json package.json
COPY src src
COPY .env.example .env.example
COPY .gitignore .gitignore
COPY .prettierrc .prettierrc
COPY tsconfig.json tsconfig.json
COPY docker-compose.yml docker-compose.yml

# Install dependencies
RUN npm install

# Build TypeScript files
RUN npm run build

# Expose port
EXPOSE 8000

# Connect for monitoring using pm2
ENV PM2_PUBLIC_KEY 9xapvmp1uh9dhsz
ENV PM2_SECRET_KEY 9pg4fxnle839oi3

# Run the app using PM2
CMD ["pm2-runtime", "dist/server.js"]
