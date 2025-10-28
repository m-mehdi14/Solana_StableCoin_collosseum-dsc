"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-orange/5 via-transparent to-primary-dark/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-orange/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
              Ready to Start?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of DeFi on Solana. Create your first collateralized debt position with DSC Protocol.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard" className="primary-button text-lg px-8 py-4">
              Launch Dashboard
            </Link>
            <Link href="/liquidate" className="glass-card text-lg px-8 py-4 hover:bg-primary-orange/10 transition-all duration-300">
              View Liquidations
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-orange mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Decentralized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-orange mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Automated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-orange mb-2">Real-time</div>
              <div className="text-sm text-muted-foreground">Price Feeds</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
