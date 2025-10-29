"use client";

import { useConfig } from "@/components/providers/config-account-provider";
import { useCollateral } from "@/components/providers/collateral-account-provider";
import { usePythPrice } from "@/components/providers/pyth-pricefeed-provider";
import { Card, CardContent } from "@/components/ui/card";
import { getUsdValue, calculateHealthFactor } from "@/app/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TrendingUp, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'object' && value && value.toNumber) {
        return value.toNumber();
    }
    return Number(value) || defaultValue;
};

export function DashboardStatsOverview() {
    const { config } = useConfig();
    const { collateral, allCollateralAccounts } = useCollateral();
    const { solPriceFeed } = usePythPrice();

    // User's collateral stats
    let userCollateralSOL = 0;
    let userCollateralUSD = 0;
    let userMintedUSD = 0;
    let userHealthFactor = 0;

    if (collateral && solPriceFeed && config) {
        const lamports = bnToNumber(collateral.lamportBalance, 0);
        userCollateralSOL = lamports / LAMPORTS_PER_SOL;
        try {
            userCollateralUSD = getUsdValue(lamports, solPriceFeed) / LAMPORTS_PER_SOL;
        } catch (e) {
            // Skip
        }
        userMintedUSD = bnToNumber(collateral.amountMinted, 0) / 1e9;
        userHealthFactor = calculateHealthFactor(
            lamports,
            bnToNumber(collateral.amountMinted, 0),
            bnToNumber(config.liquidationThreshold, 50),
            solPriceFeed,
        );
    }

    // Protocol stats
    let totalCollateralSOL = 0;
    let totalMintedUSD = 0;
    let atRiskCount = 0;

    if (allCollateralAccounts && solPriceFeed && config) {
        allCollateralAccounts.forEach((account) => {
            const lamports = bnToNumber(account.account.lamportBalance, 0);
            totalCollateralSOL += lamports / LAMPORTS_PER_SOL;
            totalMintedUSD += bnToNumber(account.account.amountMinted, 0) / 1e9;

            const hf = calculateHealthFactor(
                lamports,
                bnToNumber(account.account.amountMinted, 0),
                bnToNumber(config.liquidationThreshold, 50),
                solPriceFeed,
            );

            if (hf < bnToNumber(config.minHealthFactor, 1)) {
                atRiskCount++;
            }
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
            // Skip
        }
    }

    const hasPosition = collateral !== null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* User Position Card */}
            <Card className="border-border/50 bg-gradient-to-br from-primary-orange/10 to-primary-dark/10 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-primary-orange/20">
                            <Wallet className="h-5 w-5 text-primary-orange" />
                        </div>
                        <span className="text-xs text-muted-foreground">Your Position</span>
                    </div>

                    {hasPosition ? (
                        <>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-foreground">
                                        {userCollateralSOL.toFixed(4)}
                                    </span>
                                    <span className="text-xs sm:text-sm text-muted-foreground">SOL</span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    ≈ ${userCollateralUSD.toFixed(2)} USD
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Health: {userHealthFactor.toFixed(2)}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">No position yet</p>
                            <p className="text-xs text-muted-foreground">
                                Deposit SOL to get started
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* DSC Minted Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {hasPosition ? "You Minted" : "Protocol Total"}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-bold text-foreground">
                                {hasPosition ? userMintedUSD.toFixed(2) : (totalMintedUSD / 1e6).toFixed(2)}
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                                {hasPosition ? "DSC" : "M DSC"}
                            </span>
                        </div>
                        {hasPosition && (
                            <p className="text-xs text-muted-foreground">
                                Protocol: {(totalMintedUSD / 1e6).toFixed(2)}M DSC
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* SOL Price Card */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="text-xs text-muted-foreground">SOL Price</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-bold text-foreground">
                                ${solPrice > 0 ? solPrice.toFixed(2) : "--"}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Live from Pyth Network
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Risk Indicator */}
            <Card className={`border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${atRiskCount > 0
                ? "bg-red-500/10"
                : "bg-card/50"
                }`}>
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${atRiskCount > 0 ? "bg-red-500/20" : "bg-green-500/20"
                            }`}>
                            {atRiskCount > 0 ? (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">Protocol Status</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-bold text-foreground">
                                {atRiskCount}
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                                At Risk
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {atRiskCount === 0
                                ? "All positions healthy"
                                : "Positions need attention"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

