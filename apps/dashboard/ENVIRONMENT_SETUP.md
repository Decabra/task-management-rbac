# Dashboard Environment Configuration

This document explains how to configure the dashboard for different environments.

## Environment Files

The dashboard uses a simple two-environment setup:

### Development Environment
- **File**: `src/environments/environment.ts`
- **API URL**: `http://localhost:3000/api`
- **Usage**: `npm run start:dashboard` (default)

### Production Environment
- **File**: `src/environments/environment.prod.ts`
- **API URL**: `http://localhost:3000/api`
- **Usage**: `npm run start:dashboard:production`

## How to Change API URL

### Method 1: Edit Environment Files
1. **Development**: Edit `src/environments/environment.ts`
2. **Production**: Edit `src/environments/environment.prod.ts`
3. Change the `apiUrl` property:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://your-api-server:3000/api',
     apiBaseUrl: 'http://your-api-server:3000',
     environment: 'development'
   };
   ```

### Method 2: Runtime Configuration
1. Edit `public/config.js`:
   ```javascript
   window.__APP_CONFIG__ = {
     apiUrl: 'http://your-api-server:3000/api'
   };
   ```

## Available Scripts

- `npm run start:dashboard` - Development environment
- `npm run start:dashboard:production` - Production environment

## Configuration Priority

1. Runtime config (`public/config.js`) - Highest priority
2. Environment files - Build time configuration
3. Default values - Fallback
