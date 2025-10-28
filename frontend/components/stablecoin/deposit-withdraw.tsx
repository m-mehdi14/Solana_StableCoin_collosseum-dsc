import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CollateralMintUI from "@/components/stablecoin/deposit";
import RedeemBurnUI from "@/components/stablecoin/withdraw";

// Modern deposit/withdraw widget
const DepositWithdrawUI = () => {
  const [mode, setMode] = useState("deposit");

  return (
    <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary-orange to-primary-dark">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
          DSC Operations
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
          Manage your collateral and stablecoin positions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="deposit" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-orange data-[state=active]:to-primary-dark data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              Deposit
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="withdraw"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-orange data-[state=active]:to-primary-dark data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">📉</span>
              Withdraw
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="deposit" className="mt-6">
          <div className="animate-fade-in">
            <CollateralMintUI />
          </div>
        </TabsContent>
        
        <TabsContent value="withdraw" className="mt-6">
          <div className="animate-fade-in">
            <RedeemBurnUI />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DepositWithdrawUI;
