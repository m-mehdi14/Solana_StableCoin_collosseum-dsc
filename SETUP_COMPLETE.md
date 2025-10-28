# 🚀 Solana StableCoin Collosseum - Setup Guide

## ✅ Setup Status

Your Solana StableCoin project has been successfully set up! Here's what's been completed:

### ✅ Completed Setup Steps

1. **✅ Program Dependencies Installed**
   - Rust dependencies resolved
   - Anchor framework configured
   - Pyth SDK integrated

2. **✅ Frontend Dependencies Installed**
   - Next.js 14 with TypeScript
   - Solana Wallet Adapter
   - Pyth Price Feed integration
   - Tailwind CSS + shadcn/ui components

3. **✅ Solana CLI Configured**
   - Connected to devnet
   - Wallet address: `FmnmmcJjA2qQRvZ8n42HL3ZjCB9CGNQE6hvWsKMh2meT`
   - Balance: 2 SOL (sufficient for testing)

4. **✅ Frontend Running**
   - Development server active on http://localhost:3000
   - All components loaded successfully

## 🎯 Project Overview

This is a **decentralized stablecoin protocol** built on Solana featuring:

- **Collateralized Debt Positions (CDP)**: Deposit SOL to mint stablecoins
- **Over-collateralization**: 200% collateral requirement (50% liquidation threshold)
- **Liquidation System**: 10% bonus for liquidators
- **Real-time Price Feeds**: Pyth Network integration
- **Modern UI**: Next.js with Tailwind CSS

## 🏗️ Architecture

```
📁 Solana_StableCoin_collosseum/
├── 📁 program/          # Solana Anchor program (Rust)
│   ├── programs/stablecoin/src/
│   │   ├── lib.rs       # Main program entry point
│   │   ├── state.rs     # Account structures
│   │   ├── instructions/ # Instruction implementations
│   │   └── utils.rs     # Helper functions
│   └── Anchor.toml      # Anchor configuration
└── 📁 frontend/         # Next.js web application
    ├── app/             # Next.js 14 app router
    ├── components/      # React components
    └── anchor/          # Anchor client setup
```

## 🚀 How to Use

### 1. **Frontend is Already Running**
   - Open http://localhost:3000 in your browser
   - Connect your Solana wallet
   - Start using the protocol!

### 2. **Available Features**

#### **Deposit/Withdraw Page** (`/`)
- Deposit SOL as collateral
- Mint stablecoins based on collateral value
- Real-time health factor calculation
- Redeem collateral by burning stablecoins

#### **Liquidation Page** (`/liquidate`)
- View all collateral accounts
- Liquidate unhealthy positions
- Earn 10% liquidation bonus

#### **Config Page** (`/config`)
- Update protocol parameters
- Adjust minimum health factor

### 3. **Program Deployment** (Optional)

If you want to deploy your own instance:

```bash
cd program
anchor build
anchor deploy
```

## 🔧 Key Configuration

### **Protocol Parameters**
- **Program ID**: `6DjiD8tQhJ9ZS3WZrwNubfoBRBrqfWacNR3bXBQ7ir91`
- **Network**: Devnet
- **Liquidation Threshold**: 50% (200% over-collateralized)
- **Liquidation Bonus**: 10%
- **Minimum Health Factor**: 1 (configurable)

### **Price Integration**
- **Feed ID**: `0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`
- **Price Feed Account**: `7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE`
- **Maximum Age**: 100 seconds

## 🎨 Frontend Features

- **Real-time Updates**: Account subscriptions for live data
- **Responsive Design**: Works on desktop and mobile
- **Wallet Integration**: Supports all major Solana wallets
- **Error Handling**: User-friendly error messages
- **Dark Theme**: Modern dark UI design

## 🔒 Security Features

- **PDA-based Accounts**: Secure account derivation
- **Health Factor Checks**: Prevents unhealthy operations
- **Price Feed Validation**: Ensures accurate pricing
- **Over-collateralization**: Protects protocol solvency

## 📊 Economic Model

```
Health Factor = (Collateral Value × Liquidation Threshold) / Amount Minted

Example:
- Deposit 1 SOL ($100)
- Liquidation Threshold: 50%
- Max Mint: $50 stablecoins
- Health Factor: 2.0 (healthy)
```

## 🛠️ Development Commands

### **Frontend**
```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
```

### **Program**
```bash
cd program
anchor build      # Build the program
anchor test       # Run tests
anchor deploy     # Deploy to devnet
```

## 🎉 You're All Set!

Your Solana StableCoin Collosseum is ready to use! The frontend is running at http://localhost:3000 and you can start:

1. **Connecting your wallet**
2. **Depositing SOL collateral**
3. **Minting stablecoins**
4. **Testing the liquidation system**

The project demonstrates a complete DeFi protocol with modern Solana development practices, real-time price feeds, and a beautiful user interface.

## 📚 Next Steps

- Explore the codebase to understand the implementation
- Test all the features with small amounts
- Deploy to mainnet when ready
- Add additional features like multiple collateral types

Happy coding! 🚀
