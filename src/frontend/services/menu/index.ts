/**
 * Menu Management Service
 *
 * Persists the user's role-based menu tree in localStorage.
 * Supports multi-role structures so different roles get different menus.
 */

import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { MenuItem, UserMenu } from "@/types/menu";
import { storage } from "@/utils/storage";

export const MenuService = {
  /**
   * Persist the user menu for the current session.
   */
  setMenu(menu: UserMenu): void {
    storage.set(STORAGE_KEYS.USER_MENU, menu);
  },

  /**
   * Retrieve the stored user menu. Returns `null` if nothing is stored.
   */
  getMenu(): UserMenu | null {
    return storage.get<UserMenu>(STORAGE_KEYS.USER_MENU);
  },

  /**
   * Remove the stored menu (e.g. on logout).
   */
  clearMenu(): void {
    storage.remove(STORAGE_KEYS.USER_MENU);
  },

  /**
   * Quick check — does a menu entry exist?
   */
  hasMenu(): boolean {
    return storage.get(STORAGE_KEYS.USER_MENU) !== null;
  },

  /**
   * Convenience: get only the menu items for a given role.
   * Useful when the stored UserMenu has a specific role and you want
   * to filter by it.
   */
  getMenuByRole(role: string): MenuItem[] | null {
    const menu = MenuService.getMenu();
    if (!menu || menu.role !== role) return null;
    return menu.menus;
  },
};
