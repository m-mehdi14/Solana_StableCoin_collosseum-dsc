"use client";

import { Network, Sparkles, TrendingUp, Shield, Zap, Coins } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Network,
      title: "CrossChain Trading",
      description: "Trade collateralized positions across multiple blockchains. Starting with Solana, with more networks coming soon.",
      gradient: "from-primary-orange to-orange-600",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Analytics",
      description: "Intelligent risk assessment and automated position management powered by advanced AI algorithms.",
      gradient: "from-primary-dark to-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Collateral Trading",
      description: "Advanced collateral trading platform with real-time price feeds and automated liquidation systems.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: Shield,
      title: "Secure & Decentralized",
      description: "Built with program-derived addresses and industry-standard security measures across all supported chains.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Automated Liquidations",
      description: "AI-driven liquidation system automatically protects protocol stability and optimizes risk management.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Coins,
      title: "Multi-Asset Support",
      description: "Trade various collateral types with intelligent cross-chain bridges and unified liquidity management.",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
              Platform Features
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced DeFi infrastructure for the next generation of cross-chain trading
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-card p-6 rounded-xl hover:scale-105 transition-all duration-300 group border-border/50"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-20 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 text-foreground`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
