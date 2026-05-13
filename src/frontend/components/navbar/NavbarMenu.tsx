"use client";

import type { LucideIcon } from "lucide-react";
import { Activity, BarChart2, FolderOpen, Layers, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const ICON_MAP: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Catalog: FolderOpen,
  Monitoring: Activity,
  Analytics: BarChart2,
  Story: Layers,
};

type Variant = "desktop" | "drawer";

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  onClick?: () => void;
  variant: Variant;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  icon: Icon,
  href,
  isActive,
  onClick,
  variant,
}) => {
  if (variant === "drawer") {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
          "px-4 py-3",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          isActive
            ? "bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300 font-semibold"
            : "text-foreground/55 hover:text-primary-600 dark:hover:text-primary-400"
        )}
      >
        <Icon
          className={cn(
            "w-4.25 h-4.25 shrink-0 transition-transform duration-200",
            isActive ? "text-primary-500" : "group-hover:scale-110"
          )}
          aria-hidden
        />
        {label}

        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
        isActive
          ? "bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-200 font-semibold"
          : "text-foreground/55 hover:text-primary-600 dark:hover:text-primary-400"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 transition-transform duration-200",
          isActive ? "text-primary-500 dark:text-primary-200" : "group-hover:scale-110"
        )}
        aria-hidden
      />
      {label}

      {isActive && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary-500" />
      )}
    </Link>
  );
};

export const NavbarMenu: React.FC<{
  variant?: Variant;
  onNavigate?: () => void;
  className?: string;
}> = ({ variant = "desktop", onNavigate, className }) => {
  const pathname = usePathname();
  const menus = useAuthStore((s) => s.user?.availableMenus) ?? [];

  const items = [...menus]
    .sort((a, b) => a.index - b.index)
    .map((menu) => (
      <NavItem
        key={menu.href}
        label={menu.name}
        icon={ICON_MAP[menu.name] ?? LayoutDashboard}
        href={menu.href}
        variant={variant}
        isActive={pathname === menu.href || pathname.startsWith(menu.href + "/")}
        onClick={onNavigate}
      />
    ));

  if (variant === "drawer") {
    return (
      <nav aria-label="Main navigation" className={cn("flex flex-col gap-1", className)}>
        {items}
      </nav>
    );
  }

  return (
    <nav aria-label="Main navigation" className={cn("flex items-center gap-0.5", className)}>
      {items}
    </nav>
  );
};