"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

import { cn, getUserInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const dropdownLinkClass = (isActive: boolean) =>
  cn(
    "block px-4 py-3 text-sm transition-colors",
    isActive
      ? "bg-primary-50 text-primary-600 font-semibold dark:bg-primary-500/10 dark:text-primary-300"
      : "text-foreground hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-300",
  );

const UserMenu: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="relative" ref={ref}>
      <button
        className={cn(
          "w-10 h-10 rounded-full bg-primary-500 text-white text-xs font-semibold flex items-center justify-center hover:bg-primary-600 transition-colors",
          "ring-2 ring-offset-2 ring-offset-background transition-all",
          open ? "ring-primary-500" : "ring-transparent",
        )}
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
      >
        {getUserInitials(user?.fullname)}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-background shadow-lg z-50">
          <div className="px-4 py-3.5 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.fullname ?? "..."}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user?.email ?? ""}
            </p>
          </div>

          <div className="py-1 border-b border-border">
            <Link
              href="/profile"
              className={dropdownLinkClass(pathname.startsWith("/profile"))}
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>
            {isAdmin && (
              <Link
                href="/user-management"
                className={dropdownLinkClass(
                  pathname.startsWith("/user-management"),
                )}
                onClick={() => setOpen(false)}
              >
                User Management
              </Link>
            )}
          </div>

          <div className="py-1 border-b border-border">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-foreground">Theme</span>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors",
                  "bg-muted text-muted-foreground",
                  "hover:bg-primary-50 hover:text-primary-600",
                  "dark:hover:bg-primary-500/15 dark:hover:text-primary-300",
                )}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5" /> Light
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors rounded-b-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export const NavbarActions: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex items-center gap-3">
      <div className="hidden lg:flex flex-col items-end">
        <span className="text-sm font-medium text-foreground leading-tight">
          {user?.fullname ?? ""}
        </span>
        <span className="text-xs text-muted-foreground capitalize leading-tight">
          {user?.role?.replace("_", " ") ?? ""}
        </span>
      </div>
      <UserMenu />
    </div>
  );
};
