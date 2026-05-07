"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import React from "react";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth-store";

import { LanguagesIcon, SunIcon } from "../icons";

const UserMenu: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const initials = user?.fullname
    ? user.fullname.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.fullname ?? "..."}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email ?? ""}
            </p>
          </div>
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-b-xl"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export const LanguageButton: React.FC = () => {
  const { locale, toggleLocale } = useTranslation();

  return (
    <button
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
      onClick={toggleLocale}
      aria-label={`Switch to ${locale === "en" ? "Indonesian" : "English"}`}
    >
      <LanguagesIcon className="w-4 h-4" aria-hidden="true" />
      <span className="uppercase font-medium text-xs">{locale}</span>
    </button>
  );
};

export const ThemeButton: React.FC<{ onToggleTheme: () => void }> = ({
  onToggleTheme,
}) => (
  <button
    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
    onClick={onToggleTheme}
    aria-label="Toggle theme"
  >
    <SunIcon className="w-4 h-4" aria-hidden="true" />
  </button>
);

export const NavbarActions: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    switch (theme) {
      case "light":
      case "system":
        setTheme("dark");
        break;
      case "dark":
        setTheme("light");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <LanguageButton />
      <ThemeButton onToggleTheme={handleToggleTheme} />
      <UserMenu />
    </div>
  );
};
