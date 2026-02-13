#!/bin/bash

# Render API Deployment Script
echo "🚀 Starting Render deployment for DiscoverGroup API..."

# Step 1: Install only API dependencies
echo "📦 Installing API dependencies..."
cd apps/api
npm ci

# Step 2: Build the API
echo "🔨 Building API..."
npm run build

# Step 3: Create deployment structure expected by railway.json
echo "📁 Setting up deployment structure..."
cd ../..
mkdir -p dist-node/apps/api/src
cp -r apps/api/dist/* dist-node/apps/api/src/

# Step 4: Copy API package files for runtime dependencies
echo "📄 Copying package files..."
cp apps/api/package.json dist-node/apps/api/
cp apps/api/package-lock.json dist-node/apps/api/ 2>/dev/null || echo "No package-lock.json found"

# Step 5: Install production dependencies at deployment location
echo "🎯 Installing production dependencies..."
cd dist-node/apps/api
npm ci --production

echo "✅ Render deployment build completed successfully!"
echo "📍 API ready to start with: node src/index.js"