"use client";

import WalletMultiButton from "@/components/wallet-multi-button";
import { SolanaLogo } from "@/components/ui/solana-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <SolanaLogo className="h-8 w-8 sm:h-9 sm:w-9 text-primary-orange" />
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
                DSC Protocol
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Solana DeFi Protocol</p>
            </div>
          </div>

          {/* Wallet Button */}
          <div className="wallet-button-wrapper">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
}
