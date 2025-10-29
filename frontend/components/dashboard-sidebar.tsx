"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wallet,
    TrendingDown,
    Settings,
    Home,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SolanaLogo } from "@/components/ui/solana-logo";

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

const navItems = [
    {
        title: "Home",
        href: "/",
        icon: Home,
    },
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Liquidate",
        href: "/liquidate",
        icon: TrendingDown,
    },
    {
        title: "Config",
        href: "/config",
        icon: Settings,
    },
];

export function DashboardSidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div
            className={cn(
                "h-full w-64 border-r border-border/50 bg-background/95 backdrop-blur-xl transition-transform duration-300",
                className
            )}
        >
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">
                    <div className="flex items-center space-x-3">
                        <SolanaLogo className="h-6 w-6 text-primary-orange" />
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
                                DSC Protocol
                            </h1>
                            <p className="text-xs text-muted-foreground">DeFi Protocol</p>
                        </div>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 lg:hidden"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    "hover:bg-primary-orange/10 hover:text-primary-orange",
                                    isActive
                                        ? "bg-primary-orange/10 text-primary-orange"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.title}</span>
                                {isActive && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-orange" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-border/50 p-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">
                            Built on Solana
                        </p>
                        <p className="mt-1 text-xs font-medium text-foreground">
                            Version 1.0.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

