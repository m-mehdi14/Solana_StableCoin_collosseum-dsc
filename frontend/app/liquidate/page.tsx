"use client";

import CollateralAccountsTable from "@/components/stablecoin/collateral-table";
import { LiquidationHero } from "@/components/liquidation-hero";

export default function LiquidatePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <LiquidationHero />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-fade-in">
            <CollateralAccountsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
