"use client";

import { SolanaLogo } from "@/components/ui/solana-logo";
import Link from "next/link";
import { Sparkles, Network, TrendingUp, ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-orange/10 via-transparent to-primary-dark/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-dark/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Key Features Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-orange/10 border border-primary-orange/30 backdrop-blur-sm">
              <Network className="h-4 w-4 text-primary-orange" />
              <span className="text-sm font-semibold text-primary-orange">CrossChain</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-dark/10 border border-primary-dark/30 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary-dark" />
              <span className="text-sm font-semibold text-primary-dark">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-500">Collateral Trading Platform</span>
            </div>
          </div>

          {/* Logo and Title */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <SolanaLogo className="h-16 w-16 sm:h-20 sm:w-20 text-primary-orange" />
              <div className="absolute inset-0 h-16 w-16 sm:h-20 sm:w-20 bg-primary-orange/20 rounded-full animate-ping" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-orange via-white to-primary-dark bg-clip-text text-transparent">
              DSC Protocol
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            The next-generation <span className="font-semibold text-primary-orange">CrossChain</span>,{" "}
            <span className="font-semibold text-primary-dark">AI-Powered</span>{" "}
            <span className="font-semibold text-green-500">Collateral Trading Platform</span>.
            Trade collateralized positions across multiple blockchains with intelligent automation.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 primary-button text-lg px-8 py-4"
            >
              Launch Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
