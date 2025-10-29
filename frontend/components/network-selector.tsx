"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SolanaLogo } from "@/components/ui/solana-logo";
import { cn } from "@/lib/utils";

type Network = {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    available: boolean;
};

const networks: Network[] = [
    {
        id: "solana",
        name: "Solana",
        icon: SolanaLogo,
        available: true,
    },
    // More networks will be added here in the future
];

export function NetworkSelector() {
    const [open, setOpen] = React.useState(false);
    const [selectedNetwork, setSelectedNetwork] = React.useState(networks[0]);

    const handleNetworkSelect = (network: Network) => {
        if (network.available) {
            setSelectedNetwork(network);
            setOpen(false);
        }
    };

    const SelectedIcon = selectedNetwork.icon;

    return (
        <>
            <Button
                variant="outline"
                className="flex items-center gap-2 border-border/50 bg-background/50 hover:bg-background/80"
                onClick={() => setOpen(true)}
            >
                <SelectedIcon className="h-4 w-4 text-primary-orange" />
                <span className="hidden sm:inline">{selectedNetwork.name}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary-orange to-primary-dark bg-clip-text text-transparent">
                            Select Network
                        </DialogTitle>
                        <DialogDescription>
                            Choose a blockchain network to interact with DSC Protocol
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 mt-4">
                        {networks.map((network) => {
                            const NetworkIcon = network.icon;
                            const isSelected = selectedNetwork.id === network.id;
                            const isAvailable = network.available;

                            return (
                                <button
                                    key={network.id}
                                    onClick={() => handleNetworkSelect(network)}
                                    disabled={!isAvailable}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200",
                                        "hover:bg-accent/50 hover:border-primary-orange/50",
                                        isSelected
                                            ? "border-primary-orange bg-primary-orange/10"
                                            : "border-border/50 bg-card/50",
                                        !isAvailable && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <NetworkIcon className="h-5 w-5 text-primary-orange" />
                                        <div className="text-left">
                                            <div className="font-semibold text-foreground">
                                                {network.name}
                                            </div>
                                            {!isAvailable && (
                                                <div className="text-xs text-muted-foreground">
                                                    Coming soon
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Check className="h-5 w-5 text-primary-orange" />
                                    )}
                                </button>
                            );
                        })}

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-xs text-center text-muted-foreground">
                                More networks coming soon
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

