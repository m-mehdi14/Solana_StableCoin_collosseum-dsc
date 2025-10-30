"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCollateral } from "@/components/providers/collateral-account-provider";
import { useConfig } from "@/components/providers/config-account-provider";
import { usePythPrice } from "@/components/providers/pyth-pricefeed-provider";
import { calculateHealthFactor, getUsdValue } from "@/app/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Coins, Wallet, TrendingUp, Shield, AlertTriangle, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWallet } from "@solana/wallet-adapter-react";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'object' && value && value.toNumber) {
        return value.toNumber();
    }
    return Number(value) || defaultValue;
};

export function DSCOverviewCard() {
    const { connected } = useWallet();
    const { collateral } = useCollateral();
    const { config } = useConfig();
    const { solPriceFeed } = usePythPrice();

    // Calculate user stats
    let userCollateralSOL = 0;
    let userCollateralUSD = 0;
    let userMintedUSD = 0;
    let userHealthFactor = 0;
    const hasPosition = collateral !== null && connected;

    if (hasPosition && collateral && solPriceFeed && config) {
        const lamports = bnToNumber(collateral.lamportBalance, 0);
        const amountMinted = bnToNumber(collateral.amountMinted, 0);

        userCollateralSOL = lamports / LAMPORTS_PER_SOL;
        try {
            userCollateralUSD = getUsdValue(lamports, solPriceFeed) / LAMPORTS_PER_SOL;
        } catch (e) {
            // Skip
        }
        userMintedUSD = amountMinted / 1e9;
        userHealthFactor = calculateHealthFactor(
            lamports,
            amountMinted,
            bnToNumber(config.liquidationThreshold, 50),
            solPriceFeed,
        );
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

    const minHealthFactor = bnToNumber(config?.minHealthFactor, 1);
    const liquidationThreshold = bnToNumber(config?.liquidationThreshold, 50);

    const getHealthStatus = () => {
        if (!hasPosition) return { status: 'none', color: 'text-muted-foreground', bg: 'bg-muted/50', label: 'No Position' };
        if (userHealthFactor >= minHealthFactor * 1.5) return { status: 'healthy', color: 'text-green-500', bg: 'bg-green-500/20', label: 'HEALTHY' };
        if (userHealthFactor >= minHealthFactor) return { status: 'caution', color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'CAUTION' };
        return { status: 'risk', color: 'text-red-500', bg: 'bg-red-500/20', label: 'AT RISK' };
    };

    const healthStatus = getHealthStatus();

    return (
        <Card className="border-2 border-primary-orange/20 bg-gradient-to-br from-primary-orange/10 via-primary-dark/10 to-background backdrop-blur-sm shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-orange to-primary-dark">
                                <Coins className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
                                    DSC Stablecoin
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    {hasPosition ? 'Your Position' : 'Decentralized Stablecoin Protocol'}
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${healthStatus.bg} ${healthStatus.color}`}>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {healthStatus.status === 'risk' && <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                {healthStatus.status === 'healthy' && <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                <span className="text-xs sm:text-sm font-semibold">{healthStatus.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Collateral */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="h-4 w-4" />
                                <span className="text-sm font-medium">Collateral</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">
                                    {hasPosition ? userCollateralSOL.toFixed(4) : '0.0000'} SOL
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                    {hasPosition ? `≈ $${userCollateralUSD.toFixed(2)} USD` : 'Deposit SOL to start'}
                                </div>
                            </div>
                        </div>

                        {/* DSC Minted */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Coins className="h-4 w-4" />
                                <span className="text-sm font-medium">DSC Minted</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">
                                    {hasPosition ? userMintedUSD.toFixed(2) : '0.00'} DSC
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                    {hasPosition ? 'Stablecoins in circulation' : 'No DSC minted yet'}
                                </div>
                            </div>
                        </div>

                        {/* Health Factor */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">Health Factor</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Health factor measures your position&apos;s safety. A value above {minHealthFactor.toFixed(0)} is required. Higher values are safer.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="space-y-1">
                                <div className={`text-xl sm:text-2xl font-bold ${healthStatus.color}`}>
                                    {hasPosition ? userHealthFactor.toFixed(2) : '--'}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                    Min: {minHealthFactor.toFixed(0)}
                                </div>
                            </div>
                        </div>

                        {/* SOL Price */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm font-medium">SOL Price</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl sm:text-2xl font-bold text-foreground">
                                    ${solPrice > 0 ? solPrice.toFixed(2) : '--'}
                                </div>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                    Live from Pyth Network
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Protocol Info */}
                    <div className="pt-6 border-t border-border/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">Liquidation Threshold</div>
                                <div className="text-sm font-semibold">{liquidationThreshold}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">Collateral Ratio</div>
                                <div className="text-sm font-semibold">200%</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">Liquidation Bonus</div>
                                <div className="text-sm font-semibold">10%</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">Network</div>
                                <div className="text-sm font-semibold">Solana</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

