"use client";

import React from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SolanaWalletProvider } from "@/components/providers/wallet-provider";
import { ConfigProvider } from "@/components/providers/config-account-provider";
import { CollateralProvider } from "@/components/providers/collateral-account-provider";
import { PythPriceProvider } from "@/components/providers/pyth-pricefeed-provider";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
    // Always wrap with providers - they handle their own hydration
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
            suppressHydrationWarning
        >
            <SolanaWalletProvider>
                <ConfigProvider>
                    <CollateralProvider>
                        <PythPriceProvider>
                            {children}
                            <Toaster />
                        </PythPriceProvider>
                    </CollateralProvider>
                </ConfigProvider>
            </SolanaWalletProvider>
        </ThemeProvider>
    );
}

