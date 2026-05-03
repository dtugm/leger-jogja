"use client";

import { useState } from "react";

import { CesiumProvider, useCesium } from "@/components/cesium/CesiumProvider";
import CesiumViewerDynamic from "@/components/cesium/CesiumViewerDynamic";
import { Button } from "@/components/ui/button";

const CesiumDemoContent = () => {
  const { isReady, addTileset, removeTileset, flyToTileset, manager } = useCesium();
  const [tilesetLoaded, setTilesetLoaded] = useState(false);

  const handleAddTileset = async () => {
    // OSM Buildings asset ID o n Cesium Ion
    const OSM_BUILDINGS_ID = 4652748;

    await addTileset({
      id: "osm-buildings",
      assetId: OSM_BUILDINGS_ID
    });
    setTilesetLoaded(true);
  };

  const handleFlyTo = () => {
    flyToTileset("osm-buildings");
  };

  const handleToggleTerrain = (enable: boolean) => {
    manager?.setTerrain(enable);
  };

  return (
    <div className="relative w-full h-screen">
      {/* Map Container */}
      <CesiumViewerDynamic />

      {/* UI Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
        <h1 className="text-lg font-bold">Cesium Control Panel</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Status: {isReady ? "✅ Ready" : "⏳ Initializing..."}
        </p>

        <div className="flex flex-col gap-2 mt-2">
          {!tilesetLoaded ? (
            <Button onClick={handleAddTileset} disabled={!isReady}>
              Add OSM Buildings
            </Button>
          ) : (
            <>
              <Button onClick={handleFlyTo} variant="outline">
                Fly to Buildings
              </Button>
              <Button onClick={() => {
                removeTileset("osm-buildings");
                setTilesetLoaded(false);
              }} variant="destructive">
                Remove Buildings
              </Button>
            </>
          )}

          <div className="h-px bg-slate-300 dark:bg-slate-700 my-1" />

          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleToggleTerrain(true)}>
              Terrain On
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleToggleTerrain(false)}>
              Terrain Off
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CesiumDemoPage() {
  return (
    <CesiumProvider>
      <CesiumDemoContent />
    </CesiumProvider>
  );
}
