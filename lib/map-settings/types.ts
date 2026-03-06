// Supported base layers
export type BaseLayer = "cesium" | "osm";

// Map settings structure
export interface MapSettings {
  baseLayer: BaseLayer;
  showBuildings: boolean;
  showOrtho: boolean;
  showRoads: boolean;
}

// Context value type
export interface MapSettingsContextValue {
  settings: MapSettings;
  setBaseLayer: (baseLayer: BaseLayer) => void;
  setShowBuildings: (show: boolean) => void;
  setShowOrtho: (show: boolean) => void;
  setShowRoads: (show: boolean) => void;
}
