"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useConfig } from "../providers/config-account-provider";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { calculateHealthFactor, getUsdValue, BASE_UNIT } from "@/app/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { useTransactionToast } from "./toast";
import InitializeConfig from "./initialize-config";
import { configPDA } from "@/anchor/setup";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'object' && value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || defaultValue;
};

// UI to invoke depositCollateralAndMint instruction
const CollateralMintUI = () => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [mintAmount, setMintAmount] = useState(0);
  const [maxMintAmount, setMaxMintAmount] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { config } = useConfig();
  const { collateral } = useCollateral();
  const { solPriceFeed, solUsdPriceFeedAccount } = usePythPrice();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { showTransactionToast } = useTransactionToast();

  const updateCalculations = useCallback(() => {
    if (solPriceFeed && config) {
      const existingCollateral = Number(collateral?.lamportBalance) || 0;
      const existingMinted = Number(collateral?.amountMinted) || 0;

      const depositLamports = depositAmount * LAMPORTS_PER_SOL;
      const totalCollateralLamports = existingCollateral + depositLamports;

      const totalCollateralUsd = getUsdValue(
        totalCollateralLamports,
        solPriceFeed,
      );

      const newMaxMintAmount = Math.floor(
        (totalCollateralUsd * bnToNumber(config.liquidationThreshold, 50)) / 100,
      );

      setMaxMintAmount(Math.max(0, newMaxMintAmount - existingMinted));

      const totalMintedAmount = existingMinted + mintAmount;

      if (totalMintedAmount > 0) {
        const newHealthFactor = calculateHealthFactor(
          totalCollateralLamports,
          totalMintedAmount,
          bnToNumber(config.liquidationThreshold, 50),
          solPriceFeed,
        );
        setHealthFactor(newHealthFactor);

        if (newHealthFactor < bnToNumber(config.minHealthFactor, 1)) {
          setError("Warning: Health factor would be below minimum");
        } else {
          setError("");
        }
      } else {
        setHealthFactor(0);
      }
    }
  }, [depositAmount, mintAmount, solPriceFeed, config, collateral]);

  useEffect(() => {
    updateCalculations();
  }, [updateCalculations]);

  const handleDepositAmountChange = (value: number) => {
    setDepositAmount(value);
  };

  const handleMintAmountChange = (value: number) => {
    setMintAmount(value);
  };

  const resetAmounts = () => {
    setDepositAmount(0);
    setMintAmount(0);
  };

  const handleDeposit = async () => {
    if (!publicKey || !connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!solPriceFeed) {
      setError("Price feed unavailable. Please try again later.");
      return;
    }
    if (!solUsdPriceFeedAccount) {
      setError("Price feed account unavailable. Please refresh and try again.");
      return;
    }

    if (depositAmount <= 0) {
      setError("Please enter a valid deposit amount");
      return;
    }

    if (mintAmount < 0) {
      setError("Mint amount cannot be negative");
      return;
    }

    // Check wallet balance
    try {
      const balance = await connection.getBalance(publicKey);
      const requiredBalance = depositAmount * LAMPORTS_PER_SOL + 5000; // Add 5000 lamports for transaction fees
      
      if (balance < requiredBalance) {
        setError(`Insufficient SOL balance. Required: ${(requiredBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL, Available: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        return;
      }
    } catch (balanceErr) {
      console.warn("Could not check balance:", balanceErr);
    }

    setIsLoading(true);
    setError("");

    try {
      const amountCollateral = new BN(depositAmount * LAMPORTS_PER_SOL);
      const amountToMint = new BN(mintAmount);

      // Derive all required accounts explicitly to avoid resolver issues on devnet
      const [collateralAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("collateral"), publicKey.toBuffer()],
        program.programId
      );
      const [solAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("sol"), publicKey.toBuffer()],
        program.programId
      );
      const [mintAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        program.programId
      );
      const tokenProgram = new PublicKey(
        "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
      );
      const associatedTokenProgram = new PublicKey(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
      );
      const [tokenAccount] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), tokenProgram.toBuffer(), mintAccount.toBuffer()],
        associatedTokenProgram
      );

      console.log("Creating transaction with:", {
        depositAmount: depositAmount,
        mintAmount: mintAmount,
        amountCollateral: amountCollateral.toString(),
        amountToMint: amountToMint.toString(),
        depositor: publicKey.toString(),
        priceUpdate: solUsdPriceFeedAccount?.toString(),
        configAccount: configPDA.toString(),
        collateralAccount: collateralAccount.toString(),
        solAccount: solAccount.toString(),
        mintAccount: mintAccount.toString(),
        tokenAccount: tokenAccount.toString()
      });

      // Create and send transaction directly (no simulation for devnet)
      const tx = await program.methods
        .depositCollateralAndMint(amountCollateral, amountToMint)
        .accountsStrict({
          depositor: publicKey,
          configAccount: configPDA,
          collateralAccount,
          solAccount,
          mintAccount,
          priceUpdate: solUsdPriceFeedAccount,
          tokenAccount,
          tokenProgram,
          associatedTokenProgram,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      // Set payer and blockhash to avoid WalletSendTransactionError in some adapters
      tx.feePayer = publicKey;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

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
      console.error("Error depositing collateral and minting:", err);
      
      // Provide more specific error messages
      let errorMessage = "Transaction failed";
      
      if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient SOL balance for deposit";
      } else if (err.message.includes("Account does not exist")) {
        errorMessage = "Required account not found. Please try again.";
      } else if (err.message.includes("User rejected")) {
        errorMessage = "Transaction cancelled by user";
      } else if (err.message.includes("Transaction fee payer required")) {
        errorMessage = "Wallet connection issue. Please reconnect your wallet.";
      } else if (err.message.includes("16000")) {
        errorMessage = "Health factor too low. Try minting some stablecoins or deposit more SOL.";
      } else if (err.message.includes("BelowMinimumHealthFactor")) {
        errorMessage = "Health factor below minimum. Try minting some stablecoins or deposit more SOL.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Initialize Config Component */}
      <InitializeConfig />

      {/* Wallet Connection Status */}
      {!connected && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-warning">Wallet Not Connected</AlertTitle>
          <AlertDescription className="text-warning/80">
            Please connect your wallet to deposit collateral and mint stablecoins.
          </AlertDescription>
        </Alert>
      )}

      {/* Devnet SOL Info */}
      {connected && (
        <Alert className="border-info/50 bg-info/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-info">Testing on Devnet</AlertTitle>
          <AlertDescription className="text-info/80">
            Need devnet SOL? Get free test SOL from{" "}
            <a 
              href="https://faucet.solana.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-info"
            >
              Solana Faucet
            </a>
            <br />
            <strong>Note:</strong> If you get health factor errors, try minting some stablecoins (not just depositing SOL).
          </AlertDescription>
        </Alert>
      )}

      {/* Deposit Amount */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="depositAmount" className="text-sm font-medium text-foreground">
            Deposit Amount (SOL)
          </Label>
              <span className="text-xs text-muted-foreground">
                Available: {((collateral?.lamportBalance || 0) / LAMPORTS_PER_SOL).toFixed(4) || "12.5000"} SOL
              </span>
        </div>
        <div className="relative">
          <Input
            id="depositAmount"
            type="number"
            value={depositAmount}
            onChange={(e) =>
              handleDepositAmountChange(parseFloat(e.target.value) || 0)
            }
            className="input-field text-lg font-semibold pr-12"
            placeholder="0.00"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            SOL
          </div>
        </div>
      </div>

      {/* Mint Amount */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="mintAmount" className="text-sm font-medium text-foreground">
            Mint Amount (USD)
          </Label>
          <span className="text-xs text-muted-foreground">
            Max: ${(maxMintAmount / BASE_UNIT).toFixed(2)}
          </span>
        </div>
        
        {/* Direct Input Field */}
        <div className="relative">
          <Input
            id="mintAmount"
            type="number"
            value={mintAmount / BASE_UNIT}
            onChange={(e) => handleMintAmountChange((parseFloat(e.target.value) || 0) * BASE_UNIT)}
            placeholder="0.00"
            min="0"
            max={maxMintAmount / BASE_UNIT}
            step="0.01"
            className="pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            USD
          </div>
        </div>
        
        {/* Helpful Message */}
        {depositAmount <= 0 && (
          <div className="text-xs text-muted-foreground text-center py-2">
            Enter a deposit amount to see available mint amount
          </div>
        )}
        
        {/* Suggestion for Health Factor */}
        {depositAmount > 0 && mintAmount === 0 && (
          <div className="text-xs text-warning text-center py-2 bg-warning/10 rounded-lg">
            💡 <strong>Tip:</strong> Try minting some stablecoins to avoid health factor errors
          </div>
        )}
        
        {/* Slider for Fine Control */}
        {maxMintAmount > 0 && (
          <div className="space-y-2">
            <Slider
              max={maxMintAmount}
              step={BASE_UNIT / 100}
              value={[mintAmount]}
              onValueChange={(value) => handleMintAmountChange(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">$0</span>
              <span className="font-semibold text-primary-orange">
                ${(mintAmount / BASE_UNIT).toFixed(2)}
              </span>
              <span className="text-muted-foreground">
                ${(maxMintAmount / BASE_UNIT).toFixed(2)}
              </span>
            </div>
          </div>
        )}
        
        {/* Quick Amount Buttons */}
        {maxMintAmount > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMintAmountChange(maxMintAmount * 0.25)}
              className="text-xs"
            >
              25%
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMintAmountChange(maxMintAmount * 0.5)}
              className="text-xs"
            >
              50%
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMintAmountChange(maxMintAmount * 0.75)}
              className="text-xs"
            >
              75%
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMintAmountChange(maxMintAmount)}
              className="text-xs"
            >
              Max
            </Button>
          </div>
        )}
      </div>

      {/* Health Factor Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Health Factor
          </Label>
          <span className={`text-sm font-semibold ${
            healthFactor === 0 
              ? 'text-muted-foreground' 
              : healthFactor < (config?.minHealthFactor || 0)
              ? 'text-danger'
              : healthFactor < (config?.minHealthFactor || 0) * 1.5
              ? 'text-warning'
              : 'text-success'
          }`}>
            {healthFactor === 0 ? "N/A" : healthFactor.toFixed(2)}
          </span>
        </div>
        
        <div className="relative">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                healthFactor === 0 
                  ? 'bg-muted' 
                  : healthFactor < (config?.minHealthFactor || 0)
                  ? 'bg-gradient-to-r from-danger to-red-400'
                  : healthFactor < (config?.minHealthFactor || 0) * 1.5
                  ? 'bg-gradient-to-r from-warning to-yellow-400'
                  : 'bg-gradient-to-r from-success to-green-400'
              }`}
              style={{ 
                width: `${Math.min(100, (healthFactor / ((config?.minHealthFactor || 1) * 2)) * 100)}%` 
              }}
            />
          </div>
          <div className="absolute top-0 left-0 right-0 h-3 flex items-center justify-center">
            <div className="text-xs text-muted-foreground">
              {healthFactor === 0
                ? "No tokens minted"
                : healthFactor < (config?.minHealthFactor || 0)
                ? "Below minimum"
                : healthFactor < (config?.minHealthFactor || 0) * 1.5
                ? "Caution"
                : "Healthy"}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-danger/50 bg-danger/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-danger">Warning</AlertTitle>
          <AlertDescription className="text-danger/80">{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Button */}
      <Button
        onClick={handleDeposit}
        disabled={!connected || !!error || isLoading || depositAmount <= 0 || mintAmount < 0}
        className="w-full primary-button text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>🚀</span>
            Deposit & Mint Stablecoins
          </div>
        )}
      </Button>
    </div>
  );
};

export default CollateralMintUI;
