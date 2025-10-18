#!/bin/bash

# Railway Deploy Script for NX Monorepo
echo "🚀 Starting Railway deployment..."

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build only the API (skip frontend)
echo "🔨 Building API..."
npm run build:api

# Set up database
echo "🗄️ Setting up database..."
npm run db:setup

echo "✅ Railway deployment completed successfully!"
