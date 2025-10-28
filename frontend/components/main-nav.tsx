import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1">
      {items?.map((item, index) => (
        <Link
          key={index}
          href={item.href || "#"}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
            "hover:text-primary-orange hover:bg-primary-orange/10",
            pathname === item.href
              ? "text-primary-orange bg-primary-orange/10"
              : "text-muted-foreground",
            item.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {item.title}
          {pathname === item.href && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-orange to-primary-dark rounded-full" />
          )}
        </Link>
      ))}
    </nav>
  );
}
