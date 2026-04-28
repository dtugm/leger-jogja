"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { CesiumManager } from "@/lib/cesium/CesiumManager";

interface CesiumContextType {
  manager: CesiumManager | null;
  isReady: boolean;
}

const CesiumContext = createContext<CesiumContextType>({
  manager: null,
  isReady: false,
});

export const CesiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<CesiumManager | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize manager on client side
    if (!managerRef.current) {
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      managerRef.current = new CesiumManager(token);
      setIsReady(true);
    }

    return () => {
      // We don't necessarily want to destroy the manager here 
      // if it's meant to persist across page navigations in a SPA.
      // But for a true cleanup on root unmount:
      // managerRef.current?.destroy();
    };
  }, []);

  return (
    <CesiumContext.Provider value={{ manager: managerRef.current, isReady }}>
      {children}
    </CesiumContext.Provider>
  );
};

export const useCesium = () => {
  const context = useContext(CesiumContext);

  if (!context) {
    throw new Error("useCesium must be used within a CesiumProvider");
  }

  const { manager, isReady } = context;

  // Provide convenience methods that handle null checks
  const addTileset = async (options: any) => {
    if (!manager) return null;
    return await manager.addTileset(options);
  };

  const removeTileset = (id: string) => {
    manager?.removeTileset(id);
  };

  const flyToTileset = (id: string) => {
    manager?.flyToTileset(id);
  };

  return {
    manager,
    isReady,
    addTileset,
    removeTileset,
    flyToTileset,
    viewer: manager?.getViewer() || null
  };
};
