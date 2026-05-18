/**
 * mainViewer.store.ts
 *
 * Zustand store for the main Cesium viewer.
 * Manages: layer stack, fly-to requests, active DTM terrain, active basemap.
 */

import { create } from "zustand";

import { TERRAIN_OPTIONS } from "@/components/cesium/TerrainControl";
import type {
  DTMOption,
  OrthoPhotoOption,
  XYZBasemapOptions,
} from "@/lib/cesium/types";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type LayerSourceType = "tileset" | "imagery" | "geojson";

export interface ViewerLayer {
  id: string;
  name: string;
  url: string;
  assetId?: number;
  sourceType: LayerSourceType;
  visible: boolean;
  addedAt: number;
}

export interface FlyToRequest {
  id: string;
  longitude?: number;
  latitude?: number;
  height?: number;
}

/* ------------------------------------------------------------------ */
/*  Store interface                                                     */
/* ------------------------------------------------------------------ */

interface MainViewerState {
  /* ── Layers ───────────────────────────────────────────────────── */
  layers: ViewerLayer[];
  addLayer: (layer: Omit<ViewerLayer, "addedAt">) => void;
  removeLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
  setVisibility: (id: string, visible: boolean) => void;
  clearLayers: () => void;
  hasLayer: (id: string) => boolean;

  /* ── Fly-to ───────────────────────────────────────────────────── */
  flyToRequest: FlyToRequest | null;
  requestFlyTo: (req: FlyToRequest) => void;
  clearFlyTo: () => void;

  /* ── Terrain / DTM ────────────────────────────────────────────── */
  /**
   * Active terrain provider. null = flat ellipsoid (Cesium default).
   * Setting to a DTMOption triggers CesiumLayerBridge to apply it.
   */
  activeDTM: DTMOption | null;
  setActiveDTM: (dtm: DTMOption | null) => void;

  /* ── Basemap ──────────────────────────────────────────────────── */
  activeBasemap: XYZBasemapOptions | null;
  setActiveBasemap: (basemap: XYZBasemapOptions | null) => void;

  /* ── OrthoPhoto Overlays ──────────────────────────────────────── */
  activeOrthoPhotos: OrthoPhotoOption[];
  addOrthoPhoto: (option: OrthoPhotoOption) => void;
  removeOrthoPhoto: (id: string) => void;
  hasOrthoPhoto: (id: string) => boolean;
  clearOrthoPhotos: () => void;
}

/* ------------------------------------------------------------------ */
/*  Store                                                               */
/* ------------------------------------------------------------------ */

export const useMainViewerStore = create<MainViewerState>((set, get) => ({
  /* layers */
  layers: [],
  addLayer: (layer) => {
    if (get().hasLayer(layer.id)) return;
    set((s) => ({ layers: [...s.layers, { ...layer, addedAt: Date.now() }] }));
  },
  removeLayer: (id) =>
    set((s) => ({ layers: s.layers.filter((l) => l.id !== id) })),
  toggleVisibility: (id) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l,
      ),
    })),
  setVisibility: (id, visible) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, visible } : l)),
    })),
  clearLayers: () => set({ layers: [] }),
  hasLayer: (id) => get().layers.some((l) => l.id === id),

  /* fly-to */
  flyToRequest: null,
  requestFlyTo: (req) => set({ flyToRequest: req }),
  clearFlyTo: () => set({ flyToRequest: null }),

  /* terrain */
  activeDTM: TERRAIN_OPTIONS[0].config,
  setActiveDTM: (dtm) => set({ activeDTM: dtm }),

  /* basemap */
  activeBasemap: null,
  setActiveBasemap: (basemap) => set({ activeBasemap: basemap }),

  /* orthophoto overlays */
  activeOrthoPhotos: [],
  addOrthoPhoto: (option) => {
    if (get().hasOrthoPhoto(option.id)) return;
    set((s) => ({ activeOrthoPhotos: [...s.activeOrthoPhotos, option] }));
  },
  removeOrthoPhoto: (id) =>
    set((s) => ({
      activeOrthoPhotos: s.activeOrthoPhotos.filter((o) => o.id !== id),
    })),
  hasOrthoPhoto: (id) => get().activeOrthoPhotos.some((o) => o.id === id),
  clearOrthoPhotos: () => set({ activeOrthoPhotos: [] }),
}));
