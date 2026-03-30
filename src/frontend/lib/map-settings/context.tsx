"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

import type { BaseLayer, MapSettings, MapSettingsContextValue } from "./types";

const STORAGE_KEY = "map-settings";
const DEFAULT_SETTINGS: MapSettings = {
  baseLayer: "cesium",
  showBuildings: false,
  showOrtho: true,
  showRoads: true,
};

const MapSettingsContext = createContext<MapSettingsContextValue | null>(null);

// External store for map settings
const listeners = new Set<() => void>();

// Cache for getSnapshot to ensure referential stability
let cachedSettings: MapSettings = DEFAULT_SETTINGS;
let cachedStorageValue: string | null = null;

function emitChange() {
  // Invalidate cache when changes occur
  cachedStorageValue = null;
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function isValidBaseLayer(value: unknown): value is BaseLayer {
  return value === "cesium" || value === "osm";
}

function isValidMapSettings(value: unknown): value is MapSettings {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isValidBaseLayer(obj.baseLayer) &&
    typeof obj.showBuildings === "boolean" &&
    typeof obj.showOrtho === "boolean" &&
    typeof obj.showRoads === "boolean"
  );
}

function getSnapshot(): MapSettings {
  const stored = localStorage.getItem(STORAGE_KEY);

  // Return cached value if storage hasn't changed
  if (stored === cachedStorageValue) {
    return cachedSettings;
  }

  // Update cache
  cachedStorageValue = stored;

  if (!stored) {
    cachedSettings = DEFAULT_SETTINGS;
    return cachedSettings;
  }

  try {
    const parsed = JSON.parse(stored);
    if (isValidMapSettings(parsed)) {
      cachedSettings = parsed;
      return cachedSettings;
    }
  } catch {
    // Invalid JSON, use defaults
  }

  cachedSettings = DEFAULT_SETTINGS;
  return cachedSettings;
}

function getServerSnapshot(): MapSettings | null {
  return null;
}

export function MapSettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setBaseLayer = useCallback((baseLayer: BaseLayer) => {
    const newSettings: MapSettings = { ...cachedSettings, baseLayer };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    emitChange();
  }, []);

  const setShowBuildings = useCallback((showBuildings: boolean) => {
    const newSettings: MapSettings = { ...cachedSettings, showBuildings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    emitChange();
  }, []);

  const setShowOrtho = useCallback((showOrtho: boolean) => {
    const newSettings: MapSettings = { ...cachedSettings, showOrtho };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    emitChange();
  }, []);

  const setShowRoads = useCallback((showRoads: boolean) => {
    const newSettings: MapSettings = { ...cachedSettings, showRoads };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    emitChange();
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        emitChange();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Don't render children until settings are loaded (null on server, value on client)
  if (settings === null) {
    return null;
  }

  const value: MapSettingsContextValue = {
    settings,
    setBaseLayer,
    setShowBuildings,
    setShowOrtho,
    setShowRoads,
  };

  return (
    <MapSettingsContext.Provider value={value}>
      {children}
    </MapSettingsContext.Provider>
  );
}

export function useMapSettings(): MapSettingsContextValue {
  const context = useContext(MapSettingsContext);
  if (!context) {
    throw new Error("useMapSettings must be used within a MapSettingsProvider");
  }
  return context;
}
