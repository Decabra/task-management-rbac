# Use Node.js 20.19.0
FROM node:20.19.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# Set working directory back to root
WORKDIR /app

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:api"]
