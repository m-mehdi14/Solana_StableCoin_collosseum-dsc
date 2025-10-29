"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Loader2, ExternalLink, History, ArrowDown, ArrowUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { program } from "@/anchor/setup";

interface TransactionData {
    signature: string;
    type: "deposit" | "withdraw" | "liquidate" | "unknown";
    timestamp: number;
    amount?: number;
    token?: string;
    status: "success" | "failed";
}

export function TransactionHistory() {
    const { connection } = useConnection();
    const { publicKey, connected } = useWallet();
    const [transactions, setTransactions] = useState<TransactionData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        if (!publicKey || !connected) {
            setTransactions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get transaction signatures for the user's address
            const signatures = await connection.getSignaturesForAddress(publicKey, {
                limit: 20,
            });

            // Get transaction details
            const txDetails = await Promise.all(
                signatures.map(async (sigInfo) => {
                    try {
                        const tx = await connection.getTransaction(sigInfo.signature, {
                            maxSupportedTransactionVersion: 0,
                        });

                        if (!tx) return null;

                        // Check if transaction involves our program
                        const programId = program.programId;
                        const isOurProgram = tx.transaction.message.compiledInstructions.some(
                            (ix) => {
                                const programIdIndex = ix.programIdIndex;
                                const accountKeys = tx.transaction.message.accountKeys;
                                if (accountKeys[programIdIndex]) {
                                    return accountKeys[programIdIndex].toString() === programId.toString();
                                }
                                return false;
                            }
                        );

                        if (!isOurProgram) return null;

                        // Determine transaction type from logs
                        let type: TransactionData["type"] = "unknown";
                        if (tx.meta?.logMessages) {
                            const logs = tx.meta.logMessages.join(" ");
                            if (logs.includes("deposit_collateral_and_mint")) {
                                type = "deposit";
                            } else if (logs.includes("redeem_collateral_and_burn")) {
                                type = "withdraw";
                            } else if (logs.includes("liquidate")) {
                                type = "liquidate";
                            }
                        }

                        return {
                            signature: sigInfo.signature,
                            type,
                            timestamp: sigInfo.blockTime ? sigInfo.blockTime * 1000 : Date.now(),
                            status: tx.meta?.err ? "failed" : "success",
                        };
                    } catch (e) {
                        console.error("Error fetching tx:", e);
                        return null;
                    }
                })
            );

            const validTxs = txDetails.filter((tx): tx is TransactionData => tx !== null);
            setTransactions(validTxs);
        } catch (err: any) {
            console.error("Error fetching transactions:", err);
            setError(err.message || "Failed to load transactions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [publicKey, connected]);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return "Just now";
    };

    const getTransactionIcon = (type: TransactionData["type"]) => {
        switch (type) {
            case "deposit":
                return <ArrowDown className="h-4 w-4 text-green-500" />;
            case "withdraw":
                return <ArrowUp className="h-4 w-4 text-blue-500" />;
            case "liquidate":
                return <Coins className="h-4 w-4 text-orange-500" />;
            default:
                return <History className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getTransactionLabel = (type: TransactionData["type"]) => {
        switch (type) {
            case "deposit":
                return "Deposit & Mint";
            case "withdraw":
                return "Withdraw & Burn";
            case "liquidate":
                return "Liquidation";
            default:
                return "Transaction";
        }
    };

    if (!connected) {
        return (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <History className="h-5 w-5" />
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Connect your wallet to view transaction history
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <History className="h-5 w-5" />
                        Transaction History
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchTransactions}
                        disabled={isLoading}
                        className="h-8"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Refresh"
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="text-sm text-destructive mb-4">{error}</div>
                )}

                {isLoading && transactions.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No transactions found. Start by depositing SOL and minting DSC!
                    </p>
                ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {transactions.map((tx) => (
                            <div
                                key={tx.signature}
                                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 rounded-lg bg-muted">
                                        {getTransactionIcon(tx.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">
                                                {getTransactionLabel(tx.type)}
                                            </p>
                                            {tx.status === "failed" && (
                                                <span className="text-xs text-destructive">
                                                    Failed
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(tx.timestamp)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-8 w-8 p-0"
                                >
                                    <a
                                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

