"use client";

import Image from "next/image";
import React from "react";

import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NavbarLogoProps {
  size?: "sm" | "md";
}

export const NavbarLogo: React.FC<NavbarLogoProps> = ({ size = "md" }) => {
  const { t } = useTranslation();
  const isSm = size === "sm";

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "rounded-xl overflow-hidden shrink-0",
          isSm ? "w-8 h-8" : "w-10 h-10"
        )}
      >
        <Image
          src="/assets/navbar/halal.svg"
          alt="Leger Yogyakarta"
          width={isSm ? 32 : 40}
          height={isSm ? 32 : 40}
          priority
        />
      </div>

      <div className={cn("min-w-0", isSm ? "block" : "hidden sm:block")}>
        <h1
          className={cn(
            "font-bold text-foreground leading-tight whitespace-nowrap",
            isSm ? "text-sm" : "text-base"
          )}
        >
          {t.navbar.title}
        </h1>
        <p
          className={cn(
            "text-muted-foreground leading-tight whitespace-nowrap",
            isSm ? "text-[10px] block" : "text-xs hidden lg:block"
          )}
        >
          {t.navbar.subtitle}
        </p>
      </div>
    </div>
  );
};