"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LandingHero } from "@/components/landing-hero";
import { ProtocolStats } from "@/components/protocol-stats";
import { FeaturesSection } from "@/components/features-section";

export default function LandingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-12 pb-12">
        {/* Hero Section */}
        <LandingHero />

        {/* Key Protocol Stats - Simplified */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent mb-2">
              Protocol Overview
            </h2>
            <p className="text-muted-foreground text-sm">
              Real-time metrics from the DSC Protocol
            </p>
          </div>
          <ProtocolStats />
        </section>

        {/* Features Section */}
        <FeaturesSection />
      </div>
    </DashboardLayout>
  );
}
