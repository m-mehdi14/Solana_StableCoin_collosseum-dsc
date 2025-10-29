import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDown, Coins, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "../providers/config-account-provider";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { calculateHealthFactor, getUsdValue, BASE_UNIT } from "@/app/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { useTransactionToast } from "./toast";
import InitializeConfig from "./initialize-config";

// Helper function to safely convert BN to number
const bnToNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'object' && value && value.toNumber) {
        return value.toNumber();
    }
    return Number(value) || defaultValue;
};

// UI to invoke depositCollateralAndMint instruction
export function DepositCard() {
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
    const { showTransactionToast, showLoadingToast, dismissToast } = useTransactionToast();

    const updateCalculations = useCallback(() => {
        if (solPriceFeed && config) {
            const existingCollateral = bnToNumber(collateral?.lamportBalance, 0);
            const existingMinted = bnToNumber(collateral?.amountMinted, 0);

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

    const handleDepositAndMint = async () => {
        if (!connected || !publicKey) {
            setError("Please connect your wallet");
            return;
        }

        if (!config) {
            setError("Config not initialized");
            return;
        }

        if (depositAmount <= 0) {
            setError("Please enter a deposit amount");
            return;
        }

        if (mintAmount <= 0) {
            setError("Please enter a mint amount");
            return;
        }

        if (mintAmount > maxMintAmount) {
            setError(`Cannot mint more than ${(maxMintAmount / BASE_UNIT).toFixed(2)} DSC`);
            return;
        }

        if (healthFactor > 0 && healthFactor < bnToNumber(config.minHealthFactor, 1)) {
            setError("Health factor would be below minimum");
            return;
        }

        setIsLoading(true);
        setError("");

        let loadingToastId: string | undefined;
        try {
            // Show loading toast
            loadingToastId = showLoadingToast("Depositing SOL and minting DSC...");

            const depositLamports = new BN(depositAmount * LAMPORTS_PER_SOL);
            const mintAmountBN = new BN(mintAmount);

            // Create transaction using .transaction() instead of .rpc()
            const tx = await program.methods
                .depositCollateralAndMint(depositLamports, mintAmountBN)
                .accounts({
                    depositor: publicKey,
                    priceUpdate: solUsdPriceFeedAccount,
                })
                .transaction();

            // Update loading message
            dismissToast(loadingToastId);
            loadingToastId = showLoadingToast("Confirming transaction...");

            // Send the transaction using wallet adapter
            const transactionSignature = await sendTransaction(tx, connection, {
                skipPreflight: false,
                maxRetries: 3,
            });

            // Update loading message
            dismissToast(loadingToastId);
            loadingToastId = showLoadingToast("Waiting for confirmation...");

            // Wait for confirmation
            const confirmation = await connection.confirmTransaction(
                transactionSignature,
                "confirmed"
            );

            if (confirmation.value.err) {
                throw new Error(
                    `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
                );
            }

            // Dismiss loading toast and show success
            dismissToast(loadingToastId);
            showTransactionToast(transactionSignature, "success");
            resetAmounts();
        } catch (err: any) {
            console.error("Error depositing and minting:", err);

            // Dismiss loading toast
            dismissToast(loadingToastId);

            // Provide more specific error messages
            let errorMessage = "Transaction failed";

            if (err.message.includes("insufficient funds")) {
                errorMessage = "Insufficient SOL balance for deposit";
            } else if (err.message.includes("Account does not exist")) {
                errorMessage = "Required account not found. Please try again.";
            } else if (err.message.includes("User rejected")) {
                errorMessage = "Transaction cancelled by user";
                return; // Don't show error toast for user cancellation
            } else if (err.message.includes("Transaction fee payer required")) {
                errorMessage = "Wallet connection issue. Please reconnect your wallet.";
            } else if (err.message.includes("BelowMinimumHealthFactor")) {
                errorMessage =
                    "Health factor below minimum. Try minting less or deposit more SOL.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            showTransactionToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!config) {
        return <InitializeConfig />;
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary-orange/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <div className="p-2 rounded-lg bg-green-500/20">
                        <ArrowDown className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="hidden sm:inline">Deposit & Mint DSC</span>
                    <span className="sm:hidden">Deposit & Mint</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Deposit Amount */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="deposit-amount">Deposit SOL</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Deposit SOL as collateral. The more you deposit, the more DSC you can mint.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Max: {depositAmount.toFixed(4)} SOL
                        </span>
                    </div>
                    <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount || ""}
                        onChange={(e) => handleDepositAmountChange(Number(e.target.value))}
                        step="0.01"
                        min="0"
                    />
                    <Slider
                        value={[depositAmount]}
                        onValueChange={(value) => handleDepositAmountChange(value[0])}
                        max={10}
                        step={0.1}
                        className="w-full"
                    />
                </div>

                {/* Mint Amount */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="mint-amount">Mint DSC</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Mint DSC stablecoins based on your collateral. Ensure health factor stays above minimum.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Max: {(maxMintAmount / BASE_UNIT).toFixed(2)} DSC
                        </span>
                    </div>
                    <Input
                        id="mint-amount"
                        type="number"
                        placeholder="0.00"
                        value={(mintAmount / BASE_UNIT).toFixed(2)}
                        onChange={(e) => handleMintAmountChange(Number(e.target.value) * BASE_UNIT)}
                        step="0.01"
                        min="0"
                    />
                    <Slider
                        value={[mintAmount / BASE_UNIT]}
                        onValueChange={(value) => handleMintAmountChange(value[0] * BASE_UNIT)}
                        max={maxMintAmount > 0 ? maxMintAmount / BASE_UNIT : 100}
                        step={0.1}
                        className="w-full"
                    />
                </div>

                {/* Info */}
                {healthFactor > 0 && (
                    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Health Factor</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">
                                                Health factor measures your position safety. Below minimum risks liquidation.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span className="font-semibold text-sm">{healthFactor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min Required</span>
                            <span className="font-semibold">{bnToNumber(config.minHealthFactor, 1)}</span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={handleDepositAndMint}
                    disabled={isLoading || !connected || depositAmount <= 0 || mintAmount <= 0}
                    className="w-full bg-gradient-to-r from-primary-orange to-primary-dark hover:from-primary-orange/90 hover:to-primary-dark/90 transition-all duration-200 disabled:opacity-50"
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span className="sm:inline hidden">Processing Transaction...</span>
                            <span className="sm:hidden">Processing...</span>
                        </>
                    ) : (
                        <>
                            <Coins className="mr-2 h-4 w-4" />
                            <span className="sm:inline hidden">Deposit & Mint DSC</span>
                            <span className="sm:hidden">Mint DSC</span>
                        </>
                    )}
                </Button>

                {!connected && (
                    <p className="text-xs text-center text-muted-foreground">
                        Connect your wallet to deposit
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

