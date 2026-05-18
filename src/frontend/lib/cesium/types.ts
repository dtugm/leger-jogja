import {
  Cartesian3,
  Cesium3DTileset,
  HeadingPitchRoll,
  ImageryLayer,
} from "cesium";

/* ------------------------------------------------------------------ */
/*  Tileset                                                             */
/* ------------------------------------------------------------------ */

export interface TilesetOptions {
  id: string;
  url?: string | Promise<string>;
  assetId?: number;
  show?: boolean;
  onSelect?: (feature: unknown) => void;
  onHover?: (feature: unknown) => void;
}

/* ------------------------------------------------------------------ */
/*  Imagery / Basemap                                                   */
/* ------------------------------------------------------------------ */

export interface CesiumManagerState {
  isReady: boolean;
  activeTilesets: Map<string, Cesium3DTileset>;
  imageryLayers: Map<string, ImageryLayer>;
}

/**
 * Configuration for an XYZ / slippy-map tile basemap.
 * Compatible with OpenStreetMap, CartoDB, ESRI, and any web tile server.
 */
export interface XYZBasemapOptions {
  id: string;
  name: string;
  /** URL template supporting {z}, {x}, {y}, {s}. */
  url: string;
  subdomains?: string[] | string;
  credit?: string;
  minimumLevel?: number;
  maximumLevel?: number;
}

/* ------------------------------------------------------------------ */
/*  Terrain / DTM                                                       */
/* ------------------------------------------------------------------ */

/**
 * Configuration for a Digital Terrain Model (DTM) provider.
 * Determines which terrain dataset is shown on the Cesium globe.
 */
export interface DTMOption {
  /** Unique key used in the store and bridge. */
  id: string;
  /** Display name shown in the UI. */
  name: string;
  /** One-line description of the data source / resolution. */
  description: string;
  /**
   * - "ellipsoid"  → flat WGS-84 ellipsoid, no elevation
   * - "ion"        → Cesium Ion World Terrain (requires Ion token)
   * - "arcgis"     → ArcGIS Tiled Elevation service
   * - "custom"     → Quantized-mesh terrain from a URL (e.g. GCS / S3 bucket)
   */
  type: "ellipsoid" | "ion" | "arcgis" | "custom";
  /** Cesium Ion Asset ID (used when type = "ion"). */
  assetId?: number;
  /** Service URL (used when type = "arcgis" or "custom"). */
  url?: string;
}

/* ------------------------------------------------------------------ */
/*  OrthoPhoto Overlay                                                  */
/* ------------------------------------------------------------------ */

/**
 * Configuration for an XYZ orthophoto overlay.
 * Unlike basemaps, multiple orthophotos can be active simultaneously.
 */
export interface OrthoPhotoOption {
  /** Unique key. */
  id: string;
  /** Display name shown in the UI. */
  name: string;
  /** URL template supporting {z}, {x}, {y}, {s}. */
  url: string;
  subdomains?: string[] | string;
  credit?: string;
  minimumLevel?: number;
  maximumLevel?: number;
  /** Default opacity (0–1). Default: 1. */
  alpha?: number;
}

/* ------------------------------------------------------------------ */
/*  Camera                                                              */
/* ------------------------------------------------------------------ */

export interface FlyToOptions {
  destination?: Cartesian3;
  orientation?:
    | HeadingPitchRoll
    | { heading: number; pitch: number; roll: number };
  duration?: number;
}
