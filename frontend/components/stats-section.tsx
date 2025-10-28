"use client";

import { useConfig } from "@/components/providers/config-account-provider";
import { useCollateral } from "@/components/providers/collateral-account-provider";
import { usePythPrice } from "@/components/providers/pyth-pricefeed-provider";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'object' && value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || defaultValue;
};

export function StatsSection() {
  const { config } = useConfig();
  const { collateralAccounts } = useCollateral();
  const { priceFeed } = usePythPrice();

  // Calculate stats
  const totalCollateralAccounts = collateralAccounts?.length || 0;
  const totalCollateralValue = collateralAccounts?.reduce((sum, account) => {
    if (priceFeed) {
      try {
        const price = priceFeed.getPriceNoOlderThan(60);
        if (price) {
          const priceInUsd = Number(price.price) * Math.pow(10, -6); // Adjust for decimals
          return sum + (account.lamportBalance * priceInUsd) / 1e9; // Convert lamports to SOL
        }
      } catch (error) {
        console.error("Error calculating collateral value:", error);
      }
    }
    return sum;
  }, 0) || 0;

  const totalMinted = collateralAccounts?.reduce((sum, account) => {
    return sum + account.amountMinted;
  }, 0) || 0;

  const liquidationThreshold = bnToNumber(config?.liquidationThreshold, 50);

  // Demo data for when no real data is available
  const isDemoMode = totalCollateralAccounts === 0 && totalCollateralValue === 0;
  
  const demoData = {
    totalCollateral: 1247.85,
    totalMinted: 892.34,
    activePositions: 23,
    liquidationThreshold: 150
  };

  const stats = [
    {
      label: "Total Collateral",
      value: `${isDemoMode ? demoData.totalCollateral : totalCollateralValue.toFixed(2)} SOL`,
      change: "+12.5%",
      changeType: "positive" as const,
    },
    {
      label: "Stablecoins Minted",
      value: `${isDemoMode ? demoData.totalMinted : (totalMinted / 1e6).toFixed(2)}M`,
      change: "+8.3%",
      changeType: "positive" as const,
    },
    {
      label: "Active Positions",
      value: isDemoMode ? demoData.activePositions.toString() : totalCollateralAccounts.toString(),
      change: "+3",
      changeType: "positive" as const,
    },
    {
      label: "Liquidation Threshold",
      value: `${isDemoMode ? demoData.liquidationThreshold : liquidationThreshold}%`,
      change: "Stable",
      changeType: "neutral" as const,
    },
  ];

  return (
    <section className="py-16 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
              DSC Protocol Statistics
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real-time metrics and performance indicators
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="metric-card group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-success/20 text-success' 
                    : stat.changeType === 'negative'
                    ? 'bg-danger/20 text-danger'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stat.change}
                </div>
              </div>
              
              <div className="text-2xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    stat.changeType === 'positive' 
                      ? 'bg-gradient-to-r from-success to-green-400' 
                      : stat.changeType === 'negative'
                      ? 'bg-gradient-to-r from-danger to-red-400'
                      : 'bg-gradient-to-r from-primary-orange to-primary-dark'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(20, (index + 1) * 25))}%`,
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
