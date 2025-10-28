#!/bin/bash

echo "🚀 Setting up Solana StableCoin Collosseum..."

# Check if we're in the right directory
if [ ! -d "program" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing program dependencies..."
cd program

# Remove any existing lock files
rm -f Cargo.lock
rm -f yarn.lock

# Install program dependencies
echo "Installing Rust dependencies..."
cargo check

echo "Installing Node.js dependencies..."
yarn install

echo "🔨 Building the Anchor program..."
anchor build

if [ $? -eq 0 ]; then
    echo "✅ Program built successfully!"
else
    echo "❌ Program build failed. Please check the errors above."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd ../frontend

# Install frontend dependencies
pnpm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully!"
else
    echo "❌ Frontend installation failed. Please check the errors above."
    exit 1
fi

echo "🎉 Setup complete!"
echo ""
echo "To run the project:"
echo "1. Start the frontend: cd frontend && pnpm dev"
echo "2. Deploy the program: cd program && anchor deploy"
echo ""
echo "Make sure you have:"
echo "- Solana CLI configured for devnet"
echo "- A funded wallet (run 'solana airdrop 2' if needed)"
echo "- Anchor CLI installed"
