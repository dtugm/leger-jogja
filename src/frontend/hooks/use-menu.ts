"use client";

/**
 * useMenu — convenience hook wrapping MenuService.
 *
 * Usage:
 * ```tsx
 * const { menu, setMenu, clearMenu } = useMenu();
 * ```
 */

import { useCallback, useState } from "react";

import { MenuService } from "@/services/menu";
import type { UserMenu } from "@/types/menu";

export function useMenu() {
  // Lazy initialiser: reads localStorage synchronously on first render.
  const [menu, setMenuState] = useState<UserMenu | null>(() =>
    MenuService.getMenu(),
  );

  const setMenu = useCallback((newMenu: UserMenu) => {
    MenuService.setMenu(newMenu);
    setMenuState(newMenu);
  }, []);

  const clearMenu = useCallback(() => {
    MenuService.clearMenu();
    setMenuState(null);
  }, []);

  return {
    /** The current user menu (null if not set). */
    menu,
    /** Whether a menu exists. */
    hasMenu: menu !== null,
    /** Persist and set a new menu. */
    setMenu,
    /** Clear the stored menu (e.g. on logout). */
    clearMenu,
    /** Get menu items for a specific role. */
    getMenuByRole: MenuService.getMenuByRole,
  };
}
