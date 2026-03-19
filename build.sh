#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Node.js..."
# Download and install Node.js directly to bypass NVM issues in non-interactive shells
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs || true

# Fallback if apt-get fails (e.g. lack of sudo)
if ! command -v node &> /dev/null; then
    echo "Using NVM fallback..."
    export NVM_DIR="$HOME/.nvm"
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        \. "$NVM_DIR/nvm.sh"
        nvm install 18
        nvm use 18
        nvm alias default 18
    else
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        \. "$NVM_DIR/nvm.sh"
        nvm install 18
        nvm use 18
    fi
fi

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