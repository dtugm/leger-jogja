"use client";

import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import { cn, getUserInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { NavbarActions } from "./NavbarActions";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarMenu } from "./NavbarMenu";

const DrawerFooter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();
  const router   = useRouter();
  const pathname = usePathname();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const linkClass = (active: boolean) =>
    cn(
      "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
      active
        ? "bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300"
        : "text-foreground/60 hover:text-primary-600"
    );

  return (
    <div className="px-4 pb-5 pt-1 shrink-0">
      <div className="h-px bg-border/60 mb-3" />

      <div className="flex flex-col gap-0.5 mb-3">
        <Link
          href="/profile"
          onClick={onClose}
          className={linkClass(pathname.startsWith("/profile"))}
        >
          Profile
        </Link>

        {isAdmin && (
          <Link
            href="/user-management"
            onClick={onClose}
            className={linkClass(pathname.startsWith("/user-management"))}
          >
            User Management
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left text-destructive hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="h-px bg-border/60 mb-3" />

      <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/40 dark:bg-white/5">
        <div className="w-10 h-10 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/30">
          {getUserInitials(user?.fullname)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">
            {user?.fullname ?? "—"}
          </p>
          <p className="text-[11px] text-muted-foreground capitalize leading-tight">
            {user?.role?.replace("_", " ") ?? ""}
          </p>
        </div>
        <button
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/60 z-10">
        <div className="mx-auto w-[90%] xl:max-w-[80%] grid grid-cols-[auto_1fr_auto] items-center py-5 gap-4">
          <NavbarLogo />
          <NavbarMenu className="hidden lg:flex justify-center" />
          <div className="flex items-center gap-2 justify-end">
            <div className="hidden lg:flex items-center gap-2">
              <NavbarActions />
            </div>
            <button
              className="flex lg:hidden p-2 rounded-xl text-foreground/50 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-20 lg:hidden"
            onClick={close}
            aria-hidden
          />

          <div
            className="fixed top-0 right-0 h-full w-72 z-30 flex flex-col lg:hidden animate-slide-in-right
              bg-background dark:bg-[#0d1117] border-l border-border/60 shadow-2xl shadow-black/30"
          >

            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
              <NavbarLogo />
              <button
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                onClick={close}
                aria-label="Tutup menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-px bg-border/60 mx-5 mb-3" />

            <div className="flex-1 overflow-y-auto px-4 py-2">
              <NavbarMenu variant="drawer" onNavigate={close} />
            </div>

            <DrawerFooter onClose={close} />
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;