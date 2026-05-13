"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { CesiumManager } from "@/lib/cesium/CesiumManager";
import type {
  DTMOption,
  TilesetOptions,
  XYZBasemapOptions,
} from "@/lib/cesium/types";

interface CesiumContextType {
  manager: CesiumManager | null;
  isReady: boolean;
}

const CesiumContext = createContext<CesiumContextType>({
  manager: null,
  isReady: false,
});

export const CesiumProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const managerRef = useRef<CesiumManager | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!managerRef.current) {
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      managerRef.current = new CesiumManager(token);
      setIsReady(true);
    }
  }, []);

  return (
    <CesiumContext.Provider value={{ manager: managerRef.current, isReady }}>
      {children}
    </CesiumContext.Provider>
  );
};

export const useCesium = () => {
  const context = useContext(CesiumContext);
  if (!context)
    throw new Error("useCesium must be used within a CesiumProvider");

  const { manager, isReady } = context;

  const addTileset = async (options: TilesetOptions) => {
    if (!manager) return null;
    return manager.addTileset(options);
  };
  const removeTileset = (id: string) => manager?.removeTileset(id);
  const flyToTileset = async (id: string) => manager?.flyToTileset(id);

  const setDTMTerrain = async (option: DTMOption) =>
    manager?.setDTMTerrain(option);
  const enableTerrain = async () => manager?.enableTerrain();
  const disableTerrain = () => manager?.disableTerrain();

  const setXYZBasemap = (options: XYZBasemapOptions) =>
    manager?.setXYZBasemap(options);
  const removeBasemap = () => manager?.removeBasemap();

  return {
    manager,
    isReady,
    viewer: manager?.getViewer() ?? null,
    addTileset,
    removeTileset,
    flyToTileset,
    setDTMTerrain,
    enableTerrain,
    disableTerrain,
    setXYZBasemap,
    removeBasemap,
  };
};
