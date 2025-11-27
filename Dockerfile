# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine

WORKDIR /app

# Install 'serve' to serve static files
RUN npm install -g serve

# Copy build output
COPY --from=build /app/dist ./dist

# Expose port Cloud Run will use
EXPOSE 8080

# Start the app
CMD ["serve", "-s", "dist", "-l", "${PORT:-8080}"]
