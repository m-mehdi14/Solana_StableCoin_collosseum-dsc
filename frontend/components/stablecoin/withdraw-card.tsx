"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUp, Coins, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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

export function WithdrawCard() {
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
    const { showTransactionToast, showLoadingToast, dismissToast } = useTransactionToast();

    const updateCalculations = useCallback(() => {
        if (solPriceFeed && config && collateral) {
            const remainingMinted = Math.max(bnToNumber(collateral.amountMinted, 0) - burnAmount, 0);
            const maxRedeemLamports = bnToNumber(collateral.lamportBalance, 0);

            setMaxRedeemAmount(maxRedeemLamports);

            if (isMaxRedeem) {
                setRedeemAmount(maxRedeemLamports);
            }

            if (remainingMinted === 0) {
                setHealthFactor(Number.POSITIVE_INFINITY);
            } else {
                const newHealthFactor = calculateHealthFactor(
                    maxRedeemLamports - redeemAmount,
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
    };

    const handleRedeemAmountChange = (value: number) => {
        setRedeemAmount(value);
    };

    const handleMaxRedeemToggle = (checked: boolean) => {
        setIsMaxRedeem(checked);
        if (checked && collateral) {
            setRedeemAmount(bnToNumber(collateral.lamportBalance, 0));
            setBurnAmount(bnToNumber(collateral.amountMinted, 0));
        }
    };

    const resetAmounts = () => {
        setRedeemAmount(0);
        setBurnAmount(0);
        setIsMaxRedeem(false);
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

        if (!collateralAccountPDA || !collateral) {
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

        if (redeemAmount > bnToNumber(collateral.lamportBalance, 0)) {
            setError("Redeem amount exceeds available collateral");
            return;
        }

        if (burnAmount > bnToNumber(collateral.amountMinted, 0)) {
            setError("Burn amount exceeds minted tokens");
            return;
        }

        setIsLoading(true);
        setError("");

        let loadingToastId: string | undefined;
        try {
            // Show loading toast
            loadingToastId = showLoadingToast("Burning DSC and redeeming SOL...");

            const amountCollateral = new BN(redeemAmount);
            const amountToBurn = new BN(burnAmount);

            // Create transaction using .transaction() instead of .rpc()
            const tx = await program.methods
                .redeemCollateralAndBurnTokens(amountCollateral, amountToBurn)
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
            console.error("Error redeeming collateral and burning tokens:", err);

            // Dismiss loading toast
            dismissToast(loadingToastId);

            // Provide more specific error messages
            let errorMessage = "Transaction failed";

            if (err.message.includes("insufficient funds")) {
                errorMessage = "Insufficient SOL balance for transaction fees";
            } else if (err.message.includes("Account does not exist")) {
                errorMessage = "Required account not found. Please try again.";
            } else if (err.message.includes("User rejected")) {
                errorMessage = "Transaction cancelled by user";
                return; // Don't show error toast for user cancellation
            } else if (err.message.includes("Transaction fee payer required")) {
                errorMessage = "Wallet connection issue. Please reconnect your wallet.";
            } else if (err.message.includes("BelowMinimumHealthFactor")) {
                errorMessage =
                    "Health factor below minimum. Cannot withdraw this amount.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            showTransactionToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const maxBurn = collateral ? bnToNumber(collateral.amountMinted, 0) / BASE_UNIT : 0;
    const maxRedeemSol = maxRedeemAmount / LAMPORTS_PER_SOL;
    const redeemSol = redeemAmount / LAMPORTS_PER_SOL;

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                        <ArrowUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="hidden sm:inline">Withdraw & Burn DSC</span>
                    <span className="sm:hidden">Withdraw</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
                {!connected && (
                    <Alert className="border-warning/50 bg-warning/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Connect your wallet to withdraw</AlertDescription>
                    </Alert>
                )}

                {connected && !collateral && (
                    <Alert className="border-info/50 bg-info/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Deposit collateral first to withdraw</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Burn Amount */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="burn-amount">Burn DSC</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Burn DSC stablecoins to reduce your debt and unlock collateral.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Max: {maxBurn.toFixed(2)} DSC
                        </span>
                    </div>
                    <Input
                        id="burn-amount"
                        type="number"
                        placeholder="0.00"
                        value={(burnAmount / BASE_UNIT).toFixed(2)}
                        onChange={(e) => handleBurnAmountChange(parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                        max={maxBurn}
                        disabled={!collateral}
                    />
                    <Slider
                        value={[burnAmount / BASE_UNIT]}
                        onValueChange={(value) => handleBurnAmountChange(value[0])}
                        max={maxBurn || 100}
                        step={0.1}
                        className="w-full"
                        disabled={!collateral}
                    />
                </div>

                {/* Redeem Amount */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="redeem-amount">Redeem SOL</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Redeem SOL collateral after burning DSC. You must burn enough DSC to maintain health factor above minimum.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                {redeemSol.toFixed(4)} / {maxRedeemSol.toFixed(4)} SOL
                            </span>
                            <span className="text-xs text-muted-foreground sm:hidden">
                                {redeemSol.toFixed(2)} / {maxRedeemSol.toFixed(2)}
                            </span>
                            <Switch
                                checked={isMaxRedeem}
                                onCheckedChange={handleMaxRedeemToggle}
                                disabled={!collateral}
                            />
                            <Label htmlFor="max-redeem" className="text-xs">Max</Label>
                        </div>
                    </div>
                    <Input
                        id="redeem-amount"
                        type="number"
                        placeholder="0.0000"
                        value={redeemSol.toFixed(4)}
                        onChange={(e) => handleRedeemAmountChange((parseFloat(e.target.value) || 0) * LAMPORTS_PER_SOL)}
                        step="0.0001"
                        min="0"
                        max={maxRedeemSol}
                        disabled={isMaxRedeem || !collateral}
                    />
                    <Slider
                        value={[redeemSol]}
                        onValueChange={(value) => handleRedeemAmountChange(value[0] * LAMPORTS_PER_SOL)}
                        max={maxRedeemSol || 10}
                        step={0.01}
                        className="w-full"
                        disabled={isMaxRedeem || !collateral}
                    />
                </div>

                {/* Info */}
                {healthFactor > 0 && healthFactor !== Number.POSITIVE_INFINITY && (
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
                                                Health factor after this withdrawal. Must stay above minimum to avoid liquidation.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span className="font-semibold text-sm">{healthFactor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min Required</span>
                            <span className="font-semibold">{bnToNumber(config?.minHealthFactor, 1)}</span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={handleRedeemAndBurn}
                    disabled={isLoading || !connected || !collateral || redeemAmount <= 0 || burnAmount <= 0}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-500/90 hover:to-cyan-500/90 transition-all duration-200 disabled:opacity-50"
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
                            <span className="sm:inline hidden">Withdraw & Burn DSC</span>
                            <span className="sm:hidden">Withdraw</span>
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

