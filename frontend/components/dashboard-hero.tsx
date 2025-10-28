"use client";

import { SolanaLogo } from "@/components/ui/solana-logo";

export function DashboardHero() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-orange/10 via-transparent to-primary-dark/10" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-dark/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo and Title */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <SolanaLogo className="h-16 w-16 text-primary-orange animate-pulse-glow" />
              <div className="absolute inset-0 h-16 w-16 bg-primary-orange/20 rounded-full animate-ping" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
              DSC Dashboard
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your collateralized debt positions, mint stablecoins, and monitor your portfolio health with DSC Protocol
          </p>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-primary-orange text-2xl mb-2">📈</div>
              <h3 className="font-semibold mb-1">Deposit & Mint</h3>
              <p className="text-xs text-muted-foreground">Create new positions</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <div className="text-primary-dark text-2xl mb-2">📉</div>
              <h3 className="font-semibold mb-1">Withdraw & Burn</h3>
              <p className="text-xs text-muted-foreground">Close positions</p>
            </div>
            
            <div className="glass-card p-4 rounded-xl">
              <div className="text-warning text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Liquidate</h3>
              <p className="text-xs text-muted-foreground">Manage risk</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
