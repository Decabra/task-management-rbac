#!/bin/bash

# Railway Build Script for NX Monorepo
echo "🚀 Starting Railway build process..."

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Build API only (Railway will handle this)
echo "🔨 Building API..."
npm run build:api

echo "✅ Railway build completed successfully!"
