/* ------------------------------------------------------------------ */
/*  Menu types for role-based navigation                               */
/* ------------------------------------------------------------------ */

/**
 * A single navigable menu entry.
 * Supports nested children for sub-menus / accordion groups.
 */
export interface MenuItem {
  /** Unique identifier for the menu item. */
  id: string;
  /** Display label shown in the sidebar / nav. */
  label: string;
  /** Optional icon identifier (e.g. MDI icon name). */
  icon?: string;
  /** Route path. Omit for group headers that are not navigable. */
  path?: string;
  /** Nested children for sub-navigation. */
  children?: MenuItem[];
  /** Permission keys required to see this item. */
  permissions?: string[];
}

/**
 * Represents the complete menu tree for a given user role.
 */
export interface UserMenu {
  /** Role identifier, e.g. "admin", "viewer", "operator". */
  role: string;
  /** Top-level menu items for this role. */
  menus: MenuItem[];
}
