"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import UpdateConfigUI from "@/components/stablecoin/update-config";

export default function ConfigPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
            Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Update protocol parameters and settings
          </p>
        </div>

        {/* Config Content */}
        <div className="flex justify-center">
          <UpdateConfigUI />
        </div>
      </div>
    </DashboardLayout>
  );
}
