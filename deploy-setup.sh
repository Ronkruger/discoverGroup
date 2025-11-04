#!/bin/bash

# Deployment Helper Script for DiscoverGroup Monorepo
# This script helps you set up separate deployments for client, admin, and API

echo "🚀 DiscoverGroup Deployment Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the project root directory"
  exit 1
fi

echo "📋 Current Project Structure:"
echo "   ├── src/ (Client App)"
echo "   ├── apps/admin/ (Admin Panel)"
echo "   └── apps/api/ (Backend API)"
echo ""

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command_exists git; then
  echo "❌ Git not found. Please install Git."
  exit 1
fi

if ! command_exists node; then
  echo "❌ Node.js not found. Please install Node.js."
  exit 1
fi

echo "✅ Prerequisites satisfied"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""
echo "Installing root dependencies..."
npm install

echo ""
echo "Installing admin dependencies..."
cd apps/admin && npm install && cd ../..

echo ""
echo "Installing API dependencies..."
cd apps/api && npm install && cd ../..

echo ""
echo "✅ All dependencies installed!"
echo ""

# Check for environment files
echo "🔐 Checking environment files..."
ENV_MISSING=false

if [ ! -f ".env" ]; then
  echo "⚠️  Missing: .env (Client)"
  ENV_MISSING=true
fi

if [ ! -f "apps/admin/.env" ]; then
  echo "⚠️  Missing: apps/admin/.env (Admin)"
  ENV_MISSING=true
fi

if [ ! -f "apps/api/.env" ]; then
  echo "⚠️  Missing: apps/api/.env (API)"
  ENV_MISSING=true
fi

if [ "$ENV_MISSING" = true ]; then
  echo ""
  echo "📝 To create environment files, copy from examples:"
  echo "   cp .env.example .env"
  echo "   cp apps/admin/.env.example apps/admin/.env"
  echo "   cp apps/api/.env.example apps/api/.env"
  echo ""
else
  echo "✅ All environment files present"
  echo ""
fi

# Deployment instructions
echo "🌐 Deployment Options:"
echo ""
echo "Option 1: Netlify (Recommended for Frontend)"
echo "-------------------------------------------"
echo "1. Create TWO Netlify sites:"
echo "   a) Client Site:"
echo "      - Base directory: (leave empty)"
echo "      - Build command: npm run build"
echo "      - Publish directory: src/build"
echo ""
echo "   b) Admin Site:"
echo "      - Base directory: apps/admin"
echo "      - Build command: npm run build"
echo "      - Publish directory: apps/admin/dist"
echo ""
echo "2. Set environment variables in Netlify dashboard for each site"
echo ""
echo "Option 2: Railway/Render (For API)"
echo "-----------------------------------"
echo "1. Deploy API from apps/api folder"
echo "2. Set all environment variables from apps/api/.env.example"
echo "3. Update CORS_ORIGINS with your frontend URLs"
echo ""
echo "Option 3: Vercel (Alternative)"
echo "-------------------------------"
echo "Similar to Netlify, create separate projects for client and admin"
echo ""

# Build test
echo "🏗️  Testing builds..."
echo ""
echo "Building client..."
npm run build

echo ""
echo "Building admin..."
cd apps/admin && npm run build && cd ../..

echo ""
echo "Building API..."
cd apps/api && npm run build && cd ../..

echo ""
echo "✅ All builds successful!"
echo ""

echo "📚 Next Steps:"
echo "1. Read DEPLOYMENT_GUIDE.md for detailed instructions"
echo "2. Set up your environment variables"
echo "3. Create Netlify sites for client and admin"
echo "4. Deploy API to Railway or Render"
echo "5. Update API URLs in client and admin .env files"
echo ""
echo "🎉 Setup complete! Good luck with your deployment!"
