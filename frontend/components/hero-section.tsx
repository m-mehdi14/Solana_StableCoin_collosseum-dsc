"use client";

import { SolanaLogo } from "@/components/ui/solana-logo";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-solana-purple/10 via-transparent to-solana-green/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-solana-purple/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-solana-green/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <SolanaLogo className="h-20 w-20 text-solana-purple animate-pulse-glow" />
              <div className="absolute inset-0 h-20 w-20 bg-solana-purple/20 rounded-full animate-ping" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-solana-purple via-white to-solana-green bg-clip-text text-transparent">
              StableCoin
            </span>
            <br />
            <span className="text-white">Collosseum</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Advanced DeFi protocol on Solana. Deposit SOL collateral, mint stablecoins, 
            and manage your positions with real-time price feeds and automated liquidations.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-solana-purple text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure Collateral</h3>
              <p className="text-sm text-muted-foreground">
                Deposit SOL as collateral with industry-standard security
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="text-solana-green text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">Stable Minting</h3>
              <p className="text-sm text-muted-foreground">
                Mint stablecoins backed by real-time price feeds
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="text-warning text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Auto Liquidation</h3>
              <p className="text-sm text-muted-foreground">
                Automated liquidation system protects protocol stability
              </p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="solana-button text-lg px-8 py-4">
              Start Trading
            </button>
            <button className="glass-card text-lg px-8 py-4 hover:bg-solana-purple/10 transition-all duration-300">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
