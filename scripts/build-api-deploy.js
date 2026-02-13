#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Render API deployment build...');

try {
  // Step 1: Navigate to API directory and install dependencies
  console.log('📦 Installing API dependencies...');
  const apiDir = path.join(path.dirname(__dirname), 'apps', 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found:', apiDir);
    process.exit(1);
  }
  
  process.chdir(apiDir);
  execSync('npm ci', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'development' } });

  // Step 2: Build the API
  console.log('🔨 Building API...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 3: Create deployment directory structure (matching railway.json expectations)
  console.log('📁 Creating deployment directory structure...');
  const rootDir = path.join(process.cwd(), '../..');
  const deployDir = path.join(rootDir, 'dist-node/apps/api/src');
  const apiDeployDir = path.join(rootDir, 'dist-node/apps/api');

  // Ensure the deployment directories exist
  fs.ensureDirSync(deployDir);
  fs.ensureDirSync(apiDeployDir);

  // Step 4: Copy built files to deployment location
  console.log('📋 Copying built files...');
  const distDir = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Build failed: dist directory not found at:', distDir);
    process.exit(1);
  }

  // Copy all files from dist to deployment location
  fs.copySync(distDir, deployDir);

  // Step 5: Copy package.json and package-lock.json for runtime
  console.log('📄 Copying package files...');
  const packageJson = path.join(process.cwd(), 'package.json');
  const packageLock = path.join(process.cwd(), 'package-lock.json');

  if (fs.existsSync(packageJson)) {
    fs.copySync(packageJson, path.join(apiDeployDir, 'package.json'));
  } else {
    console.error('❌ package.json not found in API directory');
    process.exit(1);
  }

  if (fs.existsSync(packageLock)) {
    fs.copySync(packageLock, path.join(apiDeployDir, 'package-lock.json'));
  }

  // Step 6: Install production dependencies at deployment location
  console.log('🎯 Installing production dependencies...');
  process.chdir(apiDeployDir);
  execSync('npm ci --production', { 
    stdio: 'inherit', 
    env: { ...process.env, NODE_ENV: 'production' } 
  });

  console.log('✅ Render API deployment build completed successfully!');
  console.log(`📍 Deployment files ready in: ${deployDir}`);
  console.log(`🚀 Start with: node src/index.js (from ${apiDeployDir})`);
  
} catch (error) {
  console.error('❌ Deployment build failed:', error.message);
  process.exit(1);
}