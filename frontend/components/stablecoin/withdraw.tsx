"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "../providers/config-account-provider";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { calculateHealthFactor, BASE_UNIT } from "@/app/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { useTransactionToast } from "./toast";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'object' && value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || defaultValue;
};

// UI to invoke redeemCollateralAndBurnTokens instruction
const RedeemBurnUI = () => {
  const [burnAmount, setBurnAmount] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [maxRedeemAmount, setMaxRedeemAmount] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);
  const [error, setError] = useState("");
  const [isMaxRedeem, setIsMaxRedeem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { config } = useConfig();
  const { collateral, collateralAccountPDA } = useCollateral();
  const { solPriceFeed, solUsdPriceFeedAccount } = usePythPrice();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { showTransactionToast } = useTransactionToast();

  const updateCalculations = useCallback(() => {
    if (solPriceFeed && config && collateral) {
      const remainingMinted = Math.max(collateral.amountMinted - burnAmount, 0);
      const maxRedeemLamports = collateral.lamportBalance;

      setMaxRedeemAmount(maxRedeemLamports);

      if (isMaxRedeem) {
        setRedeemAmount(maxRedeemLamports);
      }

      if (remainingMinted === 0) {
        setHealthFactor(Number.POSITIVE_INFINITY);
      } else {
        const newHealthFactor = calculateHealthFactor(
          collateral.lamportBalance - redeemAmount,
          remainingMinted,
          bnToNumber(config.liquidationThreshold, 50),
          solPriceFeed,
        );
        setHealthFactor(newHealthFactor);

        if (newHealthFactor < bnToNumber(config.minHealthFactor, 1) && !isMaxRedeem) {
          setError("Warning: Health factor would be below minimum");
        } else {
          setError("");
        }
      }
    }
  }, [solPriceFeed, config, collateral, burnAmount, redeemAmount, isMaxRedeem]);

  useEffect(() => {
    updateCalculations();
  }, [updateCalculations]);

  const handleBurnAmountChange = (value: number) => {
    const burnAmountInBaseUnits = Math.floor(value * BASE_UNIT);
    setBurnAmount(burnAmountInBaseUnits);
    updateCalculations();
  };

  const handleRedeemAmountChange = (value: number) => {
    setRedeemAmount(value);
    updateCalculations();
  };

  const handleMaxRedeemToggle = (checked: boolean) => {
    setIsMaxRedeem(checked);
    if (checked) {
      setRedeemAmount(maxRedeemAmount);
      setBurnAmount(collateral?.amountMinted);
    }
  };

  const resetAmounts = () => {
    setRedeemAmount(0);
    setBurnAmount(0);
  };

  const handleRedeemAndBurn = async () => {
    if (!publicKey || !connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!solPriceFeed) {
      setError("Price feed unavailable. Please try again later.");
      return;
    }

    if (!collateralAccountPDA) {
      setError("Collateral account not found. Please deposit first.");
      return;
    }

    if (redeemAmount <= 0) {
      setError("Please enter a valid redeem amount");
      return;
    }

    if (burnAmount <= 0) {
      setError("Please enter a valid burn amount");
      return;
    }

    if (redeemAmount > collateral?.lamportBalance) {
      setError("Redeem amount exceeds available collateral");
      return;
    }

    if (burnAmount > collateral?.amountMinted) {
      setError("Burn amount exceeds minted tokens");
      return;
    }

    // Check wallet balance for transaction fees
    try {
      const balance = await connection.getBalance(publicKey);
      const requiredBalance = 5000; // Transaction fees
      
      if (balance < requiredBalance) {
        setError(`Insufficient SOL for transaction fees. Required: ${(requiredBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL, Available: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        return;
      }
    } catch (balanceErr) {
      console.warn("Could not check balance:", balanceErr);
    }

    setIsLoading(true);
    setError("");

    try {
      const amountCollateral = new BN(redeemAmount);
      const amountToBurn = new BN(burnAmount);

      console.log("Creating withdraw transaction with:", {
        redeemAmount: redeemAmount,
        burnAmount: burnAmount,
        amountCollateral: amountCollateral.toString(),
        amountToBurn: amountToBurn.toString(),
        depositor: publicKey.toString(),
        priceUpdate: solUsdPriceFeedAccount?.toString()
      });

      // Create and send transaction directly (no simulation for devnet)
      const tx = await program.methods
        .redeemCollateralAndBurnTokens(amountCollateral, amountToBurn)
        .accounts({
          depositor: publicKey,
          priceUpdate: solUsdPriceFeedAccount,
        })
        .transaction();

      // Send the transaction with devnet-optimized settings
      const transactionSignature = await sendTransaction(tx, connection, {
        skipPreflight: true,
        maxRetries: 3,
      });
      
      console.log("Transaction signature", transactionSignature);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(transactionSignature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      showTransactionToast(transactionSignature);
      resetAmounts();
      setError("");
      
    } catch (err: any) {
      console.error("Error redeeming collateral and burning tokens:", err);
      
      // Provide more specific error messages
      let errorMessage = "Transaction failed";
      
      if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient SOL balance for transaction fees";
      } else if (err.message.includes("Account does not exist")) {
        errorMessage = "Required account not found. Please try again.";
      } else if (err.message.includes("User rejected")) {
        errorMessage = "Transaction cancelled by user";
      } else if (err.message.includes("Transaction fee payer required")) {
        errorMessage = "Wallet connection issue. Please reconnect your wallet.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid w-full items-center gap-4">
      {/* Wallet Connection Status */}
      {!connected && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-warning">Wallet Not Connected</AlertTitle>
          <AlertDescription className="text-warning/80">
            Please connect your wallet to withdraw collateral and burn stablecoins.
          </AlertDescription>
        </Alert>
      )}

      {/* Collateral Account Status */}
      {connected && !collateralAccountPDA && (
        <Alert className="border-info/50 bg-info/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-info">No Collateral Account</AlertTitle>
          <AlertDescription className="text-info/80">
            You need to deposit collateral first before you can withdraw.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="burnAmount">Burn Amount ($)</Label>
        <Input
          id="burnAmount"
          type="number"
          value={burnAmount / BASE_UNIT}
          onChange={(e) =>
            handleBurnAmountChange(parseFloat(e.target.value) || 0)
          }
          max={(collateral?.amountMinted || 0) / BASE_UNIT}
          //   step="0.000000001"
        />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="redeemAmount">Redeem Amount (SOL)</Label>
        <Slider
          id="redeemAmount"
          max={maxRedeemAmount}
          step={LAMPORTS_PER_SOL / 1e6}
          value={[redeemAmount]}
          onValueChange={(value) => handleRedeemAmountChange(value[0])}
          disabled={isMaxRedeem}
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {(redeemAmount / LAMPORTS_PER_SOL).toFixed(3)} /
            {(maxRedeemAmount / LAMPORTS_PER_SOL).toFixed(3)} SOL
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="maxRedeem"
              checked={isMaxRedeem}
              onCheckedChange={handleMaxRedeemToggle}
            />
            <Label htmlFor="maxRedeem">Max</Label>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label>Health Factor</Label>
        <progress
          value={healthFactor}
          max={config?.minHealthFactor * 2 || 200}
          className="w-full"
        ></progress>
        <div className="text-sm text-muted-foreground">
          {healthFactor === Number.POSITIVE_INFINITY
            ? "N/A (All tokens burned)"
            : healthFactor.toFixed(2)}
        </div>
      </div>
      <Button
        onClick={handleRedeemAndBurn}
        disabled={!connected || !!error || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          "Redeem and Burn"
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RedeemBurnUI;
