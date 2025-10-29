"use client";

import { useConfig } from "@/components/providers/config-account-provider";
import { useCollateral } from "@/components/providers/collateral-account-provider";
import { usePythPrice } from "@/components/providers/pyth-pricefeed-provider";
import { Card, CardContent } from "@/components/ui/card";
import { getUsdValue } from "@/app/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TrendingUp, Wallet, Coins, Users, Shield } from "lucide-react";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'object' && value && value.toNumber) {
        return value.toNumber();
    }
    return Number(value) || defaultValue;
};

export function ProtocolStats() {
    const { config } = useConfig();
    const { allCollateralAccounts } = useCollateral();
    const { solPriceFeed } = usePythPrice();

    // Calculate real stats
    const totalAccounts = allCollateralAccounts?.length || 0;

    let totalCollateralSOL = 0;
    let totalCollateralUSD = 0;
    let totalMintedUSD = 0;

    if (allCollateralAccounts && solPriceFeed) {
        allCollateralAccounts.forEach((account) => {
            const lamports = bnToNumber(account.account.lamportBalance, 0);
            const sol = lamports / LAMPORTS_PER_SOL;
            totalCollateralSOL += sol;

            try {
                const usdValue = getUsdValue(lamports, solPriceFeed);
                totalCollateralUSD += usdValue / LAMPORTS_PER_SOL;
            } catch (e) {
                // Skip if price unavailable
            }

            totalMintedUSD += bnToNumber(account.account.amountMinted, 0) / 1e9;
        });
    }

    // Get SOL price
    let solPrice = 0;
    if (solPriceFeed) {
        try {
            const price = solPriceFeed.getPriceNoOlderThan(60);
            if (price) {
                // Pyth prices are in 8 decimals (price.price represents price * 10^8)
                // To get actual price: divide by 10^8
                solPrice = Number(price.price) / Math.pow(10, 8);
            }
        } catch (e) {
            // Price unavailable
        }
    }

    const liquidationThreshold = bnToNumber(config?.liquidationThreshold, 50);
    const minHealthFactor = bnToNumber(config?.minHealthFactor, 1);

    const stats = [
        {
            label: "Total Collateral",
            value: totalCollateralSOL.toFixed(2),
            unit: "SOL",
            usd: `$${totalCollateralUSD > 0 ? totalCollateralUSD.toFixed(2) : "0.00"}`,
            icon: Wallet,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "DSC Minted",
            value: totalMintedUSD >= 1e6
                ? (totalMintedUSD / 1e6).toFixed(2)
                : totalMintedUSD.toFixed(2),
            unit: totalMintedUSD >= 1e6 ? "M DSC" : "DSC",
            usd: `$${totalMintedUSD.toFixed(2)}`,
            icon: Coins,
            gradient: "from-orange-500 to-red-500",
        },
        {
            label: "Active Positions",
            value: totalAccounts.toString(),
            unit: totalAccounts === 1 ? "Position" : "Positions",
            usd: "",
            icon: Users,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "SOL Price",
            value: solPrice > 0 ? solPrice.toFixed(2) : "--",
            unit: "USD",
            usd: "",
            icon: TrendingUp,
            gradient: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary-orange/10"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} bg-opacity-20`}>
                                    <Icon className={`h-4 w-4 text-foreground`} />
                                </div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-foreground">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                        {stat.unit}
                                    </span>
                                </div>

                                {stat.usd && (
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        {stat.usd}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

