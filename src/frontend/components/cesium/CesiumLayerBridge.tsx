"use client";

/**
 * CesiumLayerBridge — zero-render bridge inside <CesiumProvider>.
 *
 * Mirrors store mutations → CesiumManager:
 *   addLayer()        → manager.addTileset()
 *   removeLayer()     → manager.removeTileset()
 *   visibility        → manager.setTilesetVisibility()
 *   requestFlyTo()    → manager.flyToTileset() | flyToCoordinates()
 *   setActiveDTM()    → manager.setDTMTerrain() | disableTerrain()
 *   setActiveBasemap()→ manager.setXYZBasemap() | removeBasemap()
 */

import { useEffect, useRef } from "react";

import { useMainViewerStore, ViewerLayer } from "@/store/mainViewer.store";

import { useCesium } from "./CesiumProvider";

export function CesiumLayerBridge() {
  const { manager, isReady, addTileset, removeTileset } = useCesium();

  /* ── Layer sync ─────────────────────────────────────────────────── */

  const layers = useMainViewerStore((s) => s.layers);
  const prevLayersRef = useRef<ViewerLayer[]>([]);

  useEffect(() => {
    if (!isReady || !manager) return;
    const prev = prevLayersRef.current;
    const curr = layers;

    for (const l of curr.filter((c) => !prev.some((p) => p.id === c.id))) {
      addTileset({
        id: l.id,
        url: l.url || undefined,
        assetId: l.assetId,
        show: l.visible,
      });
    }
    for (const l of prev.filter((p) => !curr.some((c) => c.id === p.id))) {
      removeTileset(l.id);
    }
    for (const l of curr) {
      const p = prev.find((x) => x.id === l.id);
      if (p && p.visible !== l.visible)
        manager.setTilesetVisibility(l.id, l.visible);
    }
    prevLayersRef.current = curr;
  }, [layers, isReady, manager, addTileset, removeTileset]);

  /* ── Fly-to ─────────────────────────────────────────────────────── */

  const flyToRequest = useMainViewerStore((s) => s.flyToRequest);
  const clearFlyTo = useMainViewerStore((s) => s.clearFlyTo);

  useEffect(() => {
    if (!flyToRequest || !isReady || !manager) return;
    const execute = async () => {
      const result = await manager.flyToTileset(flyToRequest.id);
      if (
        !result &&
        flyToRequest.longitude !== undefined &&
        flyToRequest.latitude !== undefined
      ) {
        manager.flyToCoordinates(
          flyToRequest.longitude,
          flyToRequest.latitude,
          flyToRequest.height,
        );
      }
      clearFlyTo();
    };
    execute();
  }, [flyToRequest, isReady, manager, clearFlyTo]);

  /* ── DTM / Terrain sync ─────────────────────────────────────────── */

  const activeDTM = useMainViewerStore((s) => s.activeDTM);
  const prevDTMIdRef = useRef<string | null>(undefined as unknown as null);

  useEffect(() => {
    if (!isReady || !manager) return;
    const newId = activeDTM?.id ?? null;
    if (newId === prevDTMIdRef.current) return;
    prevDTMIdRef.current = newId;

    if (activeDTM) {
      manager.setDTMTerrain(activeDTM);
    } else {
      manager.disableTerrain();
    }
  }, [activeDTM, isReady, manager]);

  /* ── Basemap sync ───────────────────────────────────────────────── */

  const activeBasemap = useMainViewerStore((s) => s.activeBasemap);
  const prevBasemapIdRef = useRef<string | null>(undefined as unknown as null);

  useEffect(() => {
    if (!isReady || !manager) return;
    const newId = activeBasemap?.id ?? null;
    if (newId === prevBasemapIdRef.current) return;
    prevBasemapIdRef.current = newId;

    if (activeBasemap) {
      manager.setXYZBasemap(activeBasemap);
    } else {
      manager.removeBasemap();
    }
  }, [activeBasemap, isReady, manager]);

  /* ── OrthoPhoto overlay sync ───────────────────────────────────── */

  const activeOrthoPhotos = useMainViewerStore((s) => s.activeOrthoPhotos);
  const prevOrthoIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isReady || !manager) return;
    const prevIds = prevOrthoIdsRef.current;
    const currIds = activeOrthoPhotos.map((o) => o.id);

    // Added
    for (const opt of activeOrthoPhotos) {
      if (!prevIds.includes(opt.id)) {
        manager.addOrthoPhoto(opt);
      }
    }
    // Removed
    for (const id of prevIds) {
      if (!currIds.includes(id)) {
        manager.removeOrthoPhoto(id);
      }
    }

    prevOrthoIdsRef.current = currIds;
  }, [activeOrthoPhotos, isReady, manager]);

  return null;
}
