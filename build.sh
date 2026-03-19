#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Node.js via NVM..."
# Render uses nvm, make sure we have a recent node version
# We must source nvm explicitly in non-interactive shells
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 18
nvm use 18
nvm alias default 18

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "Building React frontend..."
cd frontend
npm install
npm run build

echo "Contents of frontend/dist:"
ls -la dist/

cd ..

echo "Build complete!"