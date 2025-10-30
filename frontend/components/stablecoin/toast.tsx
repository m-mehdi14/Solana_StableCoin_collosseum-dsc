"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";

// Toast with link to solana explorer transaction
export const useTransactionToast = () => {
  const { toast, dismiss } = useToast();

  const showLoadingToast = (message: string = "Processing transaction...") => {
    const { id } = toast({
      title: "Transaction Pending",
      description: (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{message}</span>
        </div>
      ),
      duration: Infinity, // Keep showing until dismissed or replaced
      className: "border-blue-500/50 bg-blue-500/10",
    });
    return id;
  };

  const showTransactionToast = (
    transactionSignature: string,
    type: "success" | "error" = "success"
  ) => {
    if (type === "error") {
      toast({
        title: "Transaction Failed",
        description: (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{transactionSignature || "Transaction could not be completed"}</span>
            </div>
          </div>
        ),
        variant: "destructive",
        duration: 7000,
      });
    } else {
      toast({
        title: "Transaction Successful!",
        description: (
          <Button
            variant="link"
            className="p-0 h-auto text-blue-500 hover:text-blue-600"
            asChild
          >
            <a
              href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              View on Solana Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ),
        duration: 7000,
        className: "border-green-500/50 bg-green-500/10",
      });
    }
  };

  const dismissToast = (toastId?: string) => {
    if (toastId) {
      dismiss(toastId);
    }
  };

  return { showTransactionToast, showLoadingToast, dismissToast };
};
