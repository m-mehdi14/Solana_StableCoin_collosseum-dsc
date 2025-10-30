"use client";

import * as React from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import WalletMultiButton from "@/components/wallet-multi-button";
import { NetworkSelector } from "./network-selector";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1 overflow-hidden bg-gradient-to-br from-accent-dark via-accent-black to-background">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block lg:w-64 flex-shrink-0 border-r border-border/50">
                    <DashboardSidebar />
                </aside>

                {/* Sidebar - Mobile */}
                {sidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <DashboardSidebar
                            className={cn(
                                "fixed left-0 top-0 z-40 h-screen lg:hidden",
                                sidebarOpen ? "translate-x-0" : "-translate-x-full"
                            )}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-xl px-4 lg:px-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="flex-1" />

                        <div className="flex items-center gap-3">
                            <NetworkSelector />
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="w-full max-w-full px-4 py-6 lg:px-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

