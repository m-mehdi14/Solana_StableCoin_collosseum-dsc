"use client";

export function LiquidationHero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-danger/10 via-transparent to-warning/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danger/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-warning/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Icon and Title */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="p-4 rounded-full bg-gradient-to-r from-danger to-warning animate-pulse-glow">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="absolute inset-0 p-4 rounded-full bg-danger/20 animate-ping" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-danger via-warning to-danger bg-clip-text text-transparent">
              DSC Liquidation
            </span>
            <br />
            <span className="text-white">Dashboard</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Monitor and liquidate unhealthy collateral positions. Protect DSC Protocol stability 
            by identifying accounts below the minimum health factor threshold.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-danger text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Live health factor tracking for all positions
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="text-warning text-3xl mb-3">🛡️</div>
              <h3 className="text-lg font-semibold mb-2">Automated Protection</h3>
              <p className="text-sm text-muted-foreground">
                Instant liquidation when thresholds are breached
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="text-success text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">Liquidation Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Earn bonuses for maintaining protocol health
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="glass-card px-6 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                <span className="text-sm font-medium">High Risk Positions</span>
              </div>
            </div>
            <div className="glass-card px-6 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                <span className="text-sm font-medium">Caution Zone</span>
              </div>
            </div>
            <div className="glass-card px-6 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm font-medium">Healthy Positions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
