#!/bin/bash

# Render Build Script for NX Monorepo
echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build API
echo "🔨 Building API..."
npm run build:api

# Build Dashboard
echo "🔨 Building Dashboard..."
npm run build:dashboard

# Set up database
echo "🗄️ Setting up database..."
npm run db:setup

echo "✅ Build completed successfully!"
