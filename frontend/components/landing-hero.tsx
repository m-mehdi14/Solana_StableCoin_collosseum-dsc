"use client";

import { SolanaLogo } from "@/components/ui/solana-logo";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-orange/10 via-transparent to-primary-dark/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-dark/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <SolanaLogo className="h-20 w-20 text-primary-orange animate-pulse-glow" />
              <div className="absolute inset-0 h-20 w-20 bg-primary-orange/20 rounded-full animate-ping" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-orange via-white to-primary-dark bg-clip-text text-transparent">
              DSC Protocol
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            The most advanced DeFi protocol on Solana. Deposit SOL collateral, mint stablecoins, 
            and manage your positions with DSC Protocol's real-time price feeds and automated liquidations.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-primary-orange text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Secure Collateral</h3>
              <p className="text-sm text-muted-foreground">
                Deposit SOL as collateral with industry-standard security
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="text-primary-dark text-3xl mb-3">💰</div>
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
            <Link href="/dashboard" className="primary-button text-lg px-8 py-4">
              Launch Dashboard
            </Link>
            <button className="glass-card text-lg px-8 py-4 hover:bg-primary-orange/10 transition-all duration-300">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
