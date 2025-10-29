"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import CollateralAccountsTable from "@/components/stablecoin/collateral-table";

export default function LiquidatePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
            Liquidate
          </h1>
          <p className="text-muted-foreground mt-2">
            View and liquidate unhealthy collateral positions
          </p>
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          <CollateralAccountsTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
