import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCollateral } from "../providers/collateral-account-provider";
import { useConfig } from "../providers/config-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { calculateHealthFactor, getUsdValue } from "@/app/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'object' && value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || defaultValue;
};

// Display the connected wallet's collateral account
const CollateralAccount = () => {
  const { collateral } = useCollateral();
  const { config } = useConfig();
  const { solPriceFeed } = usePythPrice();

  if (!collateral || !solPriceFeed || !config) {
    // No demo data - return null when no real data is available
    return null;
  }

  const lamports = bnToNumber(collateral.lamportBalance, 0);
  const amountMinted = bnToNumber(collateral.amountMinted, 0);

  const lamportBalanceInSol = lamports / LAMPORTS_PER_SOL;
  const lamportBalanceInUsd =
    getUsdValue(lamports, solPriceFeed) / LAMPORTS_PER_SOL;
  const amountMintedInUsd = amountMinted / 1e9;
  const healthFactor = calculateHealthFactor(
    lamports,
    amountMinted,
    bnToNumber(config.liquidationThreshold, 50),
    solPriceFeed,
  );

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary-orange to-primary-dark mb-4 mx-auto w-fit">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
            DSC Account Overview
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Your collateral account
          </p>
        </div>

        <div className="space-y-6">
          {/* Collateral Balance */}
          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Collateral Balance</span>
              <span className="text-xs text-success">SOL</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {lamportBalanceInSol.toFixed(4)} SOL
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ ${lamportBalanceInUsd.toFixed(2)} USD
            </div>
          </div>

          {/* Stablecoins Owed */}
          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Stablecoins Owed</span>
              <span className="text-xs text-warning">USD</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${amountMintedInUsd.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              Minted stablecoins
            </div>
          </div>

          {/* Health Factor */}
          <div className="metric-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Health Factor</span>
              <span className={`text-xs px-2 py-1 rounded-full ${healthFactor >= bnToNumber(config.minHealthFactor, 1) * 1.5
                  ? 'bg-success/20 text-success'
                  : healthFactor >= bnToNumber(config.minHealthFactor, 1)
                    ? 'bg-warning/20 text-warning'
                    : 'bg-danger/20 text-danger'
                }`}>
                {healthFactor >= bnToNumber(config.minHealthFactor, 1) * 1.5 ? 'HEALTHY' :
                  healthFactor >= bnToNumber(config.minHealthFactor, 1) ? 'CAUTION' : 'AT RISK'}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {healthFactor.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              Min: {bnToNumber(config.minHealthFactor, 1)}
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Depositor:</span>
              <span className="font-mono text-xs">
                {collateral.depositor.toString().slice(0, 8)}...{collateral.depositor.toString().slice(-8)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">SOL Account:</span>
              <span className="font-mono text-xs">
                {collateral.solAccount.toString().slice(0, 8)}...{collateral.solAccount.toString().slice(-8)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Token Account:</span>
              <span className="font-mono text-xs">
                {collateral.tokenAccount.toString().slice(0, 8)}...{collateral.tokenAccount.toString().slice(-8)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollateralAccount;
