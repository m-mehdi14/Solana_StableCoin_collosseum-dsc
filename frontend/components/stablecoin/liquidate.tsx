import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "../providers/config-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import {
  calculateHealthFactor,
  getLamportsFromUsd,
  BASE_UNIT,
} from "@/app/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useCollateral } from "../providers/collateral-account-provider";
import { useTransactionToast } from "./toast";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'object' && value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || defaultValue;
};

interface SelectedAccount {
  pubkey: PublicKey;
  lamportBalanceInSol: number;
  amountMintedInUsd: number;
  healthFactor: number;
}

interface LiquidateUIProps {
  selectedAccount: SelectedAccount;
}

// UI to invoke liquidate instruction
const LiquidateUI: React.FC<LiquidateUIProps> = ({ selectedAccount }) => {
  const [liquidateAmount, setLiquidateAmount] = useState(0);
  const [maxLiquidateAmount, setMaxLiquidateAmount] = useState(0);
  const [isMaxLiquidate, setIsMaxLiquidate] = useState(false);
  const [solToReceive, setSolToReceive] = useState(0);
  const [liquidationBonus, setLiquidationBonus] = useState(0);
  const [remainingMinted, setRemainingMinted] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { config } = useConfig();
  const { refetchCollateralAccount } = useCollateral();
  const { solPriceFeed, solUsdPriceFeedAccount } = usePythPrice();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { showTransactionToast } = useTransactionToast();

  const updateCalculations = useCallback(() => {
    if (solPriceFeed && config && selectedAccount) {
      const effectiveLiquidateAmount = isMaxLiquidate
        ? selectedAccount.amountMintedInUsd * BASE_UNIT // Convert USD to base units
        : liquidateAmount;

      // Convert USD amount to lamports using current SOL price
      const lamports = getLamportsFromUsd(
        effectiveLiquidateAmount / BASE_UNIT, // Convert back to USD for price calculation
        solPriceFeed,
      );
      
      // Calculate liquidation bonus (10% by default)
      const liquidationBonus = bnToNumber(config.liquidationBonus, 10);
      const bonus = (lamports * liquidationBonus) / 100;
      const totalSolToReceive = lamports + bonus;

      setSolToReceive(totalSolToReceive / LAMPORTS_PER_SOL); // Convert to SOL
      setLiquidationBonus(bonus / LAMPORTS_PER_SOL); // Convert to SOL

      // Calculate remaining minted amount after liquidation
      const remainingMinted = Math.max(
        selectedAccount.amountMintedInUsd * BASE_UNIT - effectiveLiquidateAmount,
        0,
      );
      setRemainingMinted(remainingMinted);

      // Calculate remaining collateral after liquidation
      const remainingCollateral =
        selectedAccount.lamportBalanceInSol * LAMPORTS_PER_SOL - totalSolToReceive;

      // Calculate new health factor after liquidation
      const liquidationThreshold = bnToNumber(config.liquidationThreshold, 50);
      const newHealthFactor = calculateHealthFactor(
        remainingCollateral,
        remainingMinted,
        liquidationThreshold,
        solPriceFeed,
      );
      setHealthFactor(newHealthFactor);

      // Set max liquidation amount (can't liquidate more than what's minted)
      setMaxLiquidateAmount(selectedAccount.amountMintedInUsd * BASE_UNIT);

      console.log("Liquidation calculations:", {
        effectiveLiquidateAmount: effectiveLiquidateAmount / BASE_UNIT,
        lamports: lamports / LAMPORTS_PER_SOL,
        bonus: bonus / LAMPORTS_PER_SOL,
        totalSolToReceive: totalSolToReceive / LAMPORTS_PER_SOL,
        remainingMinted: remainingMinted / BASE_UNIT,
        remainingCollateral: remainingCollateral / LAMPORTS_PER_SOL,
        newHealthFactor: newHealthFactor
      });
    }
  }, [solPriceFeed, config, selectedAccount, liquidateAmount, isMaxLiquidate]);

  useEffect(() => {
    updateCalculations();
  }, [updateCalculations]);

  const handleLiquidateAmountChange = (value: number[]) => {
    setLiquidateAmount(value[0]);
    updateCalculations();
  };

  const handleMaxLiquidateToggle = (checked: boolean) => {
    setIsMaxLiquidate(checked);
    if (checked) {
      setLiquidateAmount(maxLiquidateAmount);
    }
    updateCalculations();
  };

  const resetAmounts = () => {
    setLiquidateAmount(0);
    setIsMaxLiquidate(false);
    updateCalculations();
  };

  const handleLiquidate = async () => {
    if (!publicKey || !connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!selectedAccount) {
      setError("No account selected for liquidation");
      return;
    }

    if (!solPriceFeed) {
      setError("Price feed unavailable. Please try again later.");
      return;
    }

    if (!config) {
      setError("Config account not found. Please initialize first.");
      return;
    }

    if (liquidateAmount <= 0) {
      setError("Please enter a valid liquidation amount");
      return;
    }

    // Validate account data
    if (selectedAccount.healthFactor === undefined || selectedAccount.healthFactor === null) {
      setError("Account health factor not available. Please refresh and try again.");
      return;
    }

    if (selectedAccount.lamportBalanceInSol === undefined || selectedAccount.lamportBalanceInSol === null) {
      setError("Account collateral data not available. Please refresh and try again.");
      return;
    }

    if (selectedAccount.amountMintedInUsd === undefined || selectedAccount.amountMintedInUsd === null) {
      setError("Account debt data not available. Please refresh and try again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const amountToBurn = new BN(liquidateAmount);

      // Derive all required accounts first
      const [configAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      const [solAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("sol"), selectedAccount.pubkey.toBuffer()],
        program.programId
      );

      const [mintAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        program.programId
      );

      // Manually derive associated token address (since PublicKey.findAssociatedTokenAddressSync doesn't exist)
      const [liquidatorTokenAccount] = PublicKey.findProgramAddressSync(
        [
          publicKey.toBuffer(),
          new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL").toBuffer(),
          mintAccount.toBuffer(),
        ],
        new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
      );

      console.log("Creating liquidation transaction with:", {
        liquidateAmount: liquidateAmount,
        amountToBurn: amountToBurn.toString(),
        liquidator: publicKey.toString(),
        collateralAccount: selectedAccount.pubkey.toString(),
        priceUpdate: solUsdPriceFeedAccount?.toString(),
        configAccount: configAccount.toString(),
        solAccount: solAccount.toString(),
        mintAccount: mintAccount.toString(),
        tokenAccount: liquidatorTokenAccount.toString(),
        tokenProgram: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
      });

      // Check if the token account exists
      const tokenAccountInfo = await connection.getAccountInfo(liquidatorTokenAccount);
      if (!tokenAccountInfo) {
        throw new Error("You don't have any stablecoins to liquidate. Please mint some stablecoins first.");
      }

      // Check token balance
      const tokenBalance = await connection.getTokenAccountBalance(liquidatorTokenAccount);
      if (tokenBalance.value.uiAmount === 0 || tokenBalance.value.uiAmount === null) {
        throw new Error("You don't have any stablecoins to liquidate. Please mint some stablecoins first.");
      }

      // Check if you have enough tokens to burn
      const availableTokens = tokenBalance.value.amount;
      if (amountToBurn.gt(new BN(availableTokens))) {
        throw new Error(`Insufficient stablecoin balance. Available: ${tokenBalance.value.uiAmount?.toFixed(2)} USD, Required: ${(liquidateAmount / BASE_UNIT).toFixed(2)} USD`);
      }

      // Check if the account is actually liquidatable (health factor < 1)
      const minHealthFactor = bnToNumber(config?.minHealthFactor, 1);
      if (selectedAccount.healthFactor >= minHealthFactor) {
        throw new Error(`Account is healthy and cannot be liquidated. Health factor: ${selectedAccount.healthFactor.toFixed(2)}, Required: < ${minHealthFactor}`);
      }

      const tx = await program.methods
        .liquidate(amountToBurn)
        .accounts({
          liquidator: publicKey,
          priceUpdate: solUsdPriceFeedAccount,
          configAccount: configAccount,
          collateralAccount: selectedAccount.pubkey,
          solAccount: solAccount,
          mintAccount: mintAccount,
          tokenAccount: liquidatorTokenAccount,
          tokenProgram: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"), // Token-2022 program
          systemProgram: PublicKey.default,
        })
        .transaction();

      const transactionSignature = await sendTransaction(tx, connection, {
        skipPreflight: true,
        maxRetries: 3,
      });
      
      console.log("Liquidation transaction signature:", transactionSignature);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(transactionSignature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      refetchCollateralAccount(selectedAccount.pubkey);
      showTransactionToast(transactionSignature);
      resetAmounts();
      setError("");
      
    } catch (err: any) {
      console.error("Error during liquidation:", err);
      
      // Provide more specific error messages
      let errorMessage = "Liquidation failed";
      
      if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient stablecoin balance for liquidation";
      } else if (err.message.includes("AboveMinimumHealthFactor")) {
        errorMessage = "Account is healthy and cannot be liquidated";
      } else if (err.message.includes("Account does not exist")) {
        errorMessage = "Required account not found. Please try again.";
      } else if (err.message.includes("User rejected")) {
        errorMessage = "Transaction cancelled by user";
      } else if (err.message.includes("3012")) {
        errorMessage = "Liquidation constraint violation. Please check: 1) You have stablecoins to burn, 2) Account is unhealthy (health factor < 1), 3) All accounts exist";
      } else if (err.message.includes("You don't have any stablecoins")) {
        errorMessage = err.message;
      } else if (err.message.includes("Account is healthy")) {
        errorMessage = err.message;
      } else if (err.message.includes("Insufficient stablecoin balance")) {
        errorMessage = err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-danger">⚡</span>
          Liquidate Position
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Account: {selectedAccount.pubkey.toString().slice(0, 8)}...{selectedAccount.pubkey.toString().slice(-8)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          {/* Wallet Connection Status */}
          {!connected && (
            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-warning">Wallet Not Connected</AlertTitle>
              <AlertDescription className="text-warning/80">
                Please connect your wallet to liquidate positions.
              </AlertDescription>
            </Alert>
          )}

          {/* Account Status */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Health Factor:</span>
              <span className={`font-semibold ${
                selectedAccount.healthFactor < bnToNumber(config?.minHealthFactor, 1) ? 'text-danger' :
                selectedAccount.healthFactor < bnToNumber(config?.minHealthFactor, 1) * 1.5 ? 'text-warning' :
                'text-success'
              }`}>
                {selectedAccount.healthFactor ? selectedAccount.healthFactor.toFixed(2) : 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">SOL Collateral:</span>
              <span className="font-semibold">
                {selectedAccount.lamportBalanceInSol ? selectedAccount.lamportBalanceInSol.toFixed(4) : 'Loading...'} SOL
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Debt (USD):</span>
              <span className="font-semibold text-warning">
                ${selectedAccount.amountMintedInUsd ? selectedAccount.amountMintedInUsd.toFixed(2) : 'Loading...'}
              </span>
            </div>
          </div>

          {/* Liquidation Requirements */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <div className="text-sm font-medium text-info mb-2">⚠️ Liquidation Requirements:</div>
            <div className="text-xs text-info/80 space-y-1">
              <div>• You must have stablecoins to burn</div>
              <div>• Account health factor must be &lt; {bnToNumber(config?.minHealthFactor, 1)}</div>
              <div>• You'll receive SOL + {bnToNumber(config?.liquidationBonus, 10)}% bonus</div>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="liquidateAmount">Amount to Burn ($)</Label>
            <Slider
              id="liquidateAmount"
              max={maxLiquidateAmount}
              value={[liquidateAmount]}
              step={BASE_UNIT / 100}
              onValueChange={handleLiquidateAmountChange}
              disabled={isMaxLiquidate}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                ${(liquidateAmount / BASE_UNIT).toFixed(3)} / $
                {(maxLiquidateAmount / BASE_UNIT).toFixed(3)} tokens
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maxLiquidate"
                  checked={isMaxLiquidate}
                  onCheckedChange={handleMaxLiquidateToggle}
                />
                <Label htmlFor="maxLiquidate">Max</Label>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label>SOL to Receive</Label>
            <div className="text-2xl font-bold text-success">
              {solToReceive.toFixed(6)} SOL
            </div>
            <div className="text-sm text-muted-foreground">
              Including {liquidationBonus.toFixed(6)} SOL bonus (
              {bnToNumber(config?.liquidationBonus, 10)}%)
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label>Health Factor After Liquidation</Label>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  healthFactor < bnToNumber(config?.minHealthFactor, 1) ? 'bg-gradient-to-r from-danger to-red-400' :
                  healthFactor < bnToNumber(config?.minHealthFactor, 1) * 1.5 ? 'bg-gradient-to-r from-warning to-yellow-400' :
                  'bg-gradient-to-r from-success to-green-400'
                }`}
                style={{ 
                  width: `${Math.min(100, (healthFactor / (bnToNumber(config?.minHealthFactor, 1) * 2)) * 100)}%` 
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {remainingMinted === 0
                ? "N/A (All tokens burned)"
                : `${healthFactor.toFixed(2)} (Min: ${Number(config?.minHealthFactor) || 0})`}
            </div>
          </div>
          <Button
            onClick={handleLiquidate}
            disabled={!connected || !!error || isLoading || liquidateAmount <= 0}
            className="w-full danger-button"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "⚡ Liquidate Position"
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
      </CardContent>
    </Card>
  );
};

export default LiquidateUI;
