"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DSCOverviewCard } from "@/components/dsc-overview-card";
import { DashboardStatsOverview } from "@/components/dashboard-stats-overview";
import { DepositCard } from "@/components/stablecoin/deposit-card";
import { WithdrawCard } from "@/components/stablecoin/withdraw-card";
import { TransactionHistory } from "@/components/transaction-history";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Mint DSC stablecoins by depositing SOL collateral
          </p>
        </div>

        {/* Big DSC Overview Card */}
        <DSCOverviewCard />

        {/* Smaller Stats Cards */}
        <DashboardStatsOverview />

        {/* Deposit and Withdraw Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepositCard />
          <WithdrawCard />
        </div>

        {/* Transaction History */}
        <TransactionHistory />
      </div>
    </DashboardLayout>
  );
}
