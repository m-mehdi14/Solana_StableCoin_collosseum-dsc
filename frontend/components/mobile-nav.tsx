import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types/nav";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  items?: NavItem[];
  onItemClick?: () => void;
}

export function MobileNav({ items, onItemClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items?.map((item, index) => (
        <Link
          key={index}
          href={item.href || "#"}
          onClick={onItemClick}
          className={cn(
            "flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all duration-200 group",
            "hover:text-primary-orange hover:bg-primary-orange/10 hover:scale-[1.02]",
            pathname === item.href
              ? "text-primary-orange bg-primary-orange/10 scale-[1.02]"
              : "text-muted-foreground",
            item.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span className="flex-1">{item.title}</span>
          {pathname === item.href ? (
            <div className="ml-3 w-2 h-2 bg-primary-orange rounded-full animate-pulse" />
          ) : (
            <div className="ml-3 w-2 h-2 bg-transparent rounded-full group-hover:bg-primary-orange/30 transition-colors duration-200" />
          )}
        </Link>
      ))}
    </nav>
  );
}
