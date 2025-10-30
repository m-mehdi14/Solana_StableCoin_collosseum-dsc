"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { useConfig } from "../providers/config-account-provider";
import { calculateHealthFactor, getUsdValue } from "@/app/utils";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ExternalLink } from "lucide-react";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'object' && value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || defaultValue;
};
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import LiquidateUI from "./liquidate";

interface SelectedAccount {
  pubkey: PublicKey;
  lamportBalanceInSol: number;
  lamportBalanceInUsd: number;
  amountMintedInUsd: number;
  healthFactor: number;
}

// Display all collateral accounts on liquidation page
const CollateralAccountsTable = () => {
  const { allCollateralAccounts } = useCollateral();
  const { solPriceFeed } = usePythPrice();
  const { config } = useConfig();
  const [selectedAccount, setSelectedAccount] =
    useState<SelectedAccount | null>(null);

  const accountsData = useMemo(() => {
    if (!allCollateralAccounts || !solPriceFeed || !config) {
      // Return empty array when no real data is available
      return [];
    }

    return allCollateralAccounts.map((account) => {
      const lamportBalanceInSol =
        account.account.lamportBalance / LAMPORTS_PER_SOL;
      const lamportBalanceInUsd =
        getUsdValue(account.account.lamportBalance, solPriceFeed) /
        LAMPORTS_PER_SOL;
      const amountMintedInUsd = account.account.amountMinted / 1e9;
      const healthFactor = calculateHealthFactor(
        account.account.lamportBalance,
        account.account.amountMinted,
        bnToNumber(config.liquidationThreshold, 50),
        solPriceFeed,
      );

      return {
        pubkey: account.publicKey,
        lamportBalanceInSol,
        lamportBalanceInUsd,
        amountMintedInUsd,
        healthFactor,
      };
    });
  }, [allCollateralAccounts, solPriceFeed, config]);

  useEffect(() => {
    if (selectedAccount) {
      const updatedAccount = accountsData.find(
        (account) =>
          account.pubkey.toString() === selectedAccount.pubkey.toString(),
      );
      if (updatedAccount) {
        setSelectedAccount(updatedAccount);
      }
    }
  }, [accountsData, selectedAccount]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent mb-4">
              DSC Collateral Positions
            </h2>
        <p className="text-muted-foreground">
          Monitor all collateral accounts and their health factors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Total Accounts</div>
          <div className="text-2xl font-bold text-foreground">{accountsData.length}</div>
        </div>
        <div className="metric-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">At Risk</div>
          <div className="text-2xl font-bold text-danger">
            {accountsData.filter(acc => acc.healthFactor < (config?.minHealthFactor || 1)).length}
          </div>
        </div>
        <div className="metric-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Caution</div>
          <div className="text-2xl font-bold text-warning">
            {accountsData.filter(acc => 
              acc.healthFactor >= (config?.minHealthFactor || 1) && 
              acc.healthFactor < (config?.minHealthFactor || 1) * 1.5
            ).length}
          </div>
        </div>
        <div className="metric-card">
          <div className="text-sm font-medium text-muted-foreground mb-1">Healthy</div>
          <div className="text-2xl font-bold text-success">
            {accountsData.filter(acc => acc.healthFactor >= (config?.minHealthFactor || 1) * 1.5).length}
          </div>
        </div>
      </div>

      {/* Helpful Message when no accounts */}
      {accountsData.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No Collateral Accounts Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No collateral accounts are available for liquidation on devnet.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>To create collateral accounts:</p>
              <p>1. Go to the Dashboard</p>
              <p>2. Connect your wallet</p>
              <p>3. Initialize the config account</p>
              <p>4. Deposit SOL and mint stablecoins</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-xl font-semibold">All Collateral Accounts</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click liquidate to close unhealthy positions
          </p>
        </div>
        
        <div className="overflow-x-auto">
          {accountsData.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">No Collateral Accounts Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No collateral accounts are available for liquidation on devnet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Make sure you have deposited collateral and minted stablecoins first.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground font-medium">Account</TableHead>
                  <TableHead className="text-muted-foreground font-medium">SOL Balance</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Debt (USD)</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Health Factor</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {accountsData.map((account, index) => {
                const isHealthy = account.healthFactor >= (config?.minHealthFactor || 0) * 1.5;
                const isCaution = account.healthFactor >= (config?.minHealthFactor || 0) && 
                                 account.healthFactor < (config?.minHealthFactor || 0) * 1.5;
                const isAtRisk = account.healthFactor < (config?.minHealthFactor || 0);
                
                return (
                  <TableRow 
                    key={account.pubkey.toString()} 
                    className="border-border/30 hover:bg-muted/20 transition-colors duration-200"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TableCell>
                      <AddressLink pubkey={account.pubkey} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold">{account.lamportBalanceInSol.toFixed(4)} SOL</div>
                        <div className="text-sm text-muted-foreground">
                          ${account.lamportBalanceInUsd.toFixed(2)} USD
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-warning">
                        ${account.amountMintedInUsd.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className={`font-semibold ${
                          isAtRisk ? 'text-danger' : 
                          isCaution ? 'text-warning' : 
                          'text-success'
                        }`}>
                          {account.healthFactor.toFixed(2)}
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                              isAtRisk ? 'bg-gradient-to-r from-danger to-red-400' :
                              isCaution ? 'bg-gradient-to-r from-warning to-yellow-400' :
                              'bg-gradient-to-r from-success to-green-400'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (account.healthFactor / ((config?.minHealthFactor || 1) * 2)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isAtRisk ? 'bg-danger/20 text-danger' :
                        isCaution ? 'bg-warning/20 text-warning' :
                        'bg-success/20 text-success'
                      }`}>
                        {isAtRisk ? 'AT RISK' : isCaution ? 'CAUTION' : 'HEALTHY'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedAccount(account)}
                            disabled={
                              isNaN(account.healthFactor) ||
                              account.healthFactor >= bnToNumber(config?.minHealthFactor, 1)
                            }
                            className={`w-full ${
                              isAtRisk 
                                ? 'danger-button' 
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                          >
                            {isAtRisk ? '⚡ Liquidate' : '✓ Healthy'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="flex items-center justify-center border-none bg-transparent">
                          {selectedAccount && (
                            <LiquidateUI selectedAccount={selectedAccount} />
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollateralAccountsTable;

const AddressLink = ({ pubkey }: { pubkey: PublicKey }) => {
  const address = pubkey.toString();
  const shortenedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=devnet`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-primary-orange hover:text-primary-dark transition-colors duration-200 hover:underline text-sm font-mono"
    >
      {shortenedAddress}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
};
