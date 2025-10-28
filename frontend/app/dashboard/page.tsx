"use client";

import DepositAndWithdraw from "@/components/stablecoin/deposit-withdraw";
import CollateralAccountDisplay from "@/components/stablecoin/collateral";
import { DashboardHero } from "@/components/dashboard-hero";
import { StatsSection } from "@/components/stats-section";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Dashboard Hero */}
      <DashboardHero />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="animate-fade-in">
            <DepositAndWithdraw />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CollateralAccountDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}
