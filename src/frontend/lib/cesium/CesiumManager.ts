import {
  Viewer,
  Cesium3DTileset,
  IonResource,
  Cartesian3,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  PostProcessStageLibrary,
  ImageryLayer,
  createWorldTerrainAsync,
  EllipsoidTerrainProvider,
  Ion,
  Math as CesiumMath,
} from "cesium";
import { TilesetOptions, FlyToOptions } from "./types";

export class CesiumManager {
  private viewer: Viewer | null = null;
  private tilesets: Map<string, Cesium3DTileset> = new Map();
  private eventHandler: ScreenSpaceEventHandler | null = null;
  private selectedFeature: any = null;

  constructor(token?: string) {
    if (token) {
      Ion.defaultAccessToken = token;
    }
  }

  public initialize(container: HTMLDivElement, options: Viewer.ConstructorOptions = {}) {
    if (this.viewer) return this.viewer;

    this.viewer = new Viewer(container, {
      terrainProvider: new EllipsoidTerrainProvider(),
      animation: false,
      timeline: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      ...options,
    });

    // Remove credits for cleaner UI (optional, check Cesium license)
    // (this.viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';

    this.setupEvents();
    return this.viewer;
  }

  public getViewer() {
    return this.viewer;
  }

  private setupEvents() {
    if (!this.viewer) return;

    this.eventHandler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);

    // Left Click handler
    this.eventHandler.setInputAction((movement: any) => {
      const pickedObject = this.viewer?.scene.pick(movement.position);
      if (pickedObject) {
        this.handleFeatureSelect(pickedObject);
      } else {
        this.clearSelection();
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    // Hover handler (optional, can be heavy)
    this.eventHandler.setInputAction((movement: any) => {
      const pickedObject = this.viewer?.scene.pick(movement.endPosition);
      if (pickedObject) {
        // Handle hover logic here
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }

  private handleFeatureSelect(feature: any) {
    this.clearSelection();
    this.selectedFeature = feature;
    
    // Highlight logic (example: change color if it's a 3D feature)
    if (feature.color) {
      feature.originalColor = feature.color.clone();
      feature.color = Color.YELLOW.withAlpha(0.5);
    }
  }

  private clearSelection() {
    if (this.selectedFeature && this.selectedFeature.color && this.selectedFeature.originalColor) {
      this.selectedFeature.color = this.selectedFeature.originalColor;
    }
    this.selectedFeature = null;
  }

  public async addTileset(options: TilesetOptions): Promise<Cesium3DTileset | null> {
    if (!this.viewer) return null;

    try {
      const resource = options.assetId 
        ? await IonResource.fromAssetId(options.assetId)
        : options.url;

      if (!resource) throw new Error("No URL or AssetId provided for tileset");

      const tileset = await Cesium3DTileset.fromUrl(resource, {
        show: options.show ?? true,
      });

      this.viewer.scene.primitives.add(tileset);
      this.tilesets.set(options.id, tileset);
      
      return tileset;
    } catch (error) {
      console.error(`Failed to load tileset ${options.id}:`, error);
      return null;
    }
  }

  public removeTileset(id: string) {
    const tileset = this.tilesets.get(id);
    if (tileset && this.viewer) {
      this.viewer.scene.primitives.remove(tileset);
      this.tilesets.delete(id);
    }
  }

  public async flyToTileset(id: string) {
    const tileset = this.tilesets.get(id);
    if (tileset && this.viewer) {
      return this.viewer.zoomTo(tileset);
    }
  }

  public flyTo(options: FlyToOptions) {
    if (!this.viewer) return;

    this.viewer.camera.flyTo({
      destination: options.destination || Cartesian3.fromDegrees(0, 0, 1000),
      orientation: options.orientation,
      duration: options.duration ?? 2.0,
    });
  }

  public async setTerrain(enabled: boolean) {
    if (!this.viewer) return;

    if (enabled) {
      this.viewer.terrainProvider = await createWorldTerrainAsync();
    } else {
      this.viewer.terrainProvider = new EllipsoidTerrainProvider();
    }
  }

  public addImageryProvider(provider: any): ImageryLayer | null {
    if (!this.viewer) return null;
    return this.viewer.imageryLayers.addImageryProvider(provider);
  }

  public destroy() {
    if (this.eventHandler) {
      this.eventHandler.destroy();
    }
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
    this.tilesets.clear();
  }
}
