import React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Providers } from "@/components/providers/providers";

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
        suppressHydrationWarning
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {/* Background Pattern */}
            <div
              className="fixed inset-0 opacity-20 pointer-events-none z-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B35' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="relative z-10">
              {children}
            </div>
          </div>
        </Providers>
        <TailwindIndicator />
      </body>
    </html>
  );
}
