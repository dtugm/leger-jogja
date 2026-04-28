import { 
  Cesium3DTileset, 
  ImageryLayer, 
  Viewer,
  Cartesian3,
  HeadingPitchRoll
} from "cesium";

export interface TilesetOptions {
  id: string;
  url?: string | Promise<string>;
  assetId?: number;
  show?: boolean;
  onSelect?: (feature: any) => void;
  onHover?: (feature: any) => void;
}

export interface CesiumManagerState {
  isReady: boolean;
  activeTilesets: Map<string, Cesium3DTileset>;
  imageryLayers: Map<string, ImageryLayer>;
}

export interface FlyToOptions {
  destination?: Cartesian3;
  orientation?: HeadingPitchRoll | { heading: number; pitch: number; roll: number };
  duration?: number;
}
