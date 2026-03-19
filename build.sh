#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Node.js..."
# Render uses nvm, make sure we have a recent node version
if command -v nvm &> /dev/null; then
    nvm install 18
    nvm use 18
fi

echo "Building React frontend..."
cd frontend
npm install
npm run build

echo "Contents of frontend/dist:"
ls -la dist/

cd ..

echo "Build complete!"