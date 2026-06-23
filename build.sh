#!/bin/bash
set -e
set -x

echo "Starting Vercel Monorepo Build..."

echo "Building Admin Dashboard..."
cd frontend
npm install
npm run build
cd ..

echo "Building Field Client Portal..."
cd frontend-client-ticket
npm install
npm run build
cd ..

echo "Merging Builds into root dist/ directory..."
rm -rf dist
mkdir -p dist/client

# Copy Admin Dashboard to root of dist
cp -r frontend/dist/* dist/

# Copy Field Client Portal to dist/client
cp -r frontend-client-ticket/dist/* dist/client/

echo "Build Completed Successfully!"
