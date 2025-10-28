"use client";

import { LandingHero } from "@/components/landing-hero";
import { FeaturesSection } from "@/components/features-section";
import { StatsSection } from "@/components/stats-section";
import { CTASection } from "@/components/cta-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <LandingHero />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
