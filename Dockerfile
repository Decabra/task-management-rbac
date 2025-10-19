# Use Node.js 20.19.0
FROM node:20.19.0-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the TypeScript to JavaScript
WORKDIR /app/apps/api
RUN npm run build

# Set working directory back to root
WORKDIR /app

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:api"]
