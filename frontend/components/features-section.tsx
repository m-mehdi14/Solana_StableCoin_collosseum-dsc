"use client";

export function FeaturesSection() {
  const features = [
    {
      icon: "🏦",
      title: "Collateralized Debt Positions",
      description: "Create CDPs by depositing SOL collateral and minting stablecoins against it with real-time price feeds.",
    },
    {
      icon: "📊",
      title: "Real-time Price Feeds",
      description: "Powered by Pyth Network for accurate, real-time SOL/USD price data ensuring precise valuations.",
    },
    {
      icon: "⚡",
      title: "Automated Liquidations",
      description: "Smart liquidation system automatically protects protocol stability when health factors drop below threshold.",
    },
    {
      icon: "🔒",
      title: "Secure & Decentralized",
      description: "Built on Solana blockchain with program-derived addresses ensuring maximum security and decentralization.",
    },
    {
      icon: "💎",
      title: "Liquidation Rewards",
      description: "Earn bonuses for liquidating unhealthy positions, incentivizing protocol health maintenance.",
    },
    {
      icon: "📱",
      title: "Modern Interface",
      description: "Beautiful, responsive UI designed for both beginners and advanced DeFi users with real-time updates.",
    },
  ];

  return (
    <section className="py-20 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for advanced DeFi operations on Solana with DSC Protocol
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
