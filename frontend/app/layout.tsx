import React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SolanaWalletProvider } from "@/components/providers/wallet-provider";
import { ConfigProvider } from "@/components/providers/config-account-provider";
import { CollateralProvider } from "@/components/providers/collateral-account-provider";
import { PythPriceProvider } from "@/components/providers/pyth-pricefeed-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "DSC Protocol | DeFi Protocol",
  description: "Advanced collateralized debt position protocol on Solana. Deposit SOL, mint stablecoins, and manage your DeFi positions with real-time price feeds.",
  keywords: ["Solana", "DeFi", "Stablecoin", "Collateral", "Liquidation", "Web3"],
  authors: [{ name: "Solana Hackathon Team" }],
  openGraph: {
    title: "DSC Protocol",
    description: "Advanced collateralized debt position protocol on Solana",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={cn(
          "min-h-screen bg-gradient-to-br from-accent-dark via-accent-black to-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <SolanaWalletProvider>
          <ConfigProvider>
            <CollateralProvider>
              <PythPriceProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  forcedTheme="dark"
                  enableSystem
                  disableTransitionOnChange
                >
                  <div className="relative flex min-h-screen flex-col">
                    {/* Background Pattern */}
                    <div className="fixed inset-0 opacity-20" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B35' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                    
                    <SiteHeader />
                    <main className="relative z-10 flex-1">{children}</main>
                    <Toaster />
                  </div>
                </ThemeProvider>
              </PythPriceProvider>
            </CollateralProvider>
          </ConfigProvider>
        </SolanaWalletProvider>
        <TailwindIndicator />
      </body>
    </html>
  );
}
