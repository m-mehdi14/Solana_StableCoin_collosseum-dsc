"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SolanaLogo } from "@/components/ui/solana-logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <SolanaLogo className="h-8 w-8 sm:h-9 sm:w-9 text-primary-orange animate-pulse-glow" />
              <div className="absolute inset-0 h-8 w-8 sm:h-9 sm:w-9 bg-primary-orange/20 rounded-full animate-ping" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
                <span className="hidden xs:inline">DSC Protocol</span>
                <span className="xs:hidden">DSC</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Solana DeFi Protocol</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <MainNav items={siteConfig.mainNav} />
          </div>

          {/* Desktop Wallet Button */}
          <div className="hidden lg:flex lg:items-center">
            <div className="wallet-button-wrapper">
              <WalletMultiButton 
                onClick={() => console.log('Wallet button clicked')}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-3">
            <div className="sm:hidden wallet-button-wrapper-mobile">
              <WalletMultiButton />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-primary-orange/10 hover:text-primary-orange transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMounted && isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card/50 backdrop-blur-sm rounded-lg mt-2 border border-border/50 shadow-lg">
              <MobileNav items={siteConfig.mainNav} onItemClick={() => setIsMobileMenuOpen(false)} />
              <div className="pt-3 border-t border-border/50">
                <div className="px-3 wallet-button-wrapper-mobile-menu">
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
