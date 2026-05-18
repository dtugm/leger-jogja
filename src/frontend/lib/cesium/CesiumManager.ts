import {
  ArcGISTiledElevationTerrainProvider,
  Cartesian3,
  Cesium3DTileset,
  CesiumTerrainProvider,
  Color,
  createWorldTerrainAsync,
  EllipsoidTerrainProvider,
  ImageryLayer,
  Ion,
  IonResource,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  Viewer,
} from "cesium";

import {
  DTMOption,
  FlyToOptions,
  OrthoPhotoOption,
  TilesetOptions,
  XYZBasemapOptions,
} from "./types";

/** Cesium `scene.pick(...)` result for a tileset feature; we only touch `color`. */
interface PickedFeature {
  color?: Color & { clone(): Color };
  originalColor?: Color;
}

export class CesiumManager {
  private viewer: Viewer | null = null;
  private tilesets: Map<string, Cesium3DTileset> = new Map();
  /** The imagery layer Cesium created at viewer boot (Bing / Ion default). */
  private defaultImageryLayer: ImageryLayer | null = null;
  /** The XYZ tile layer we injected; null when using the Cesium default. */
  private activeBasemapLayer: ImageryLayer | null = null;
  /** XYZ overlay imagery layers (orthophotos), keyed by option id. */
  private overlayLayers: Map<string, ImageryLayer> = new Map();
  private eventHandler: ScreenSpaceEventHandler | null = null;
  private selectedFeature: PickedFeature | null = null;

  constructor(token?: string) {
    if (token) Ion.defaultAccessToken = token;
  }

  /* ---------------------------------------------------------------- */
  /*  Initialisation                                                    */
  /* ---------------------------------------------------------------- */

  public initialize(
    container: HTMLDivElement,
    options: Viewer.ConstructorOptions = {},
  ) {
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

    // Save reference to Cesium's built-in base imagery layer so we can
    // hide/restore it instead of destroying it when switching basemaps.
    if (this.viewer.imageryLayers.length > 0) {
      this.defaultImageryLayer = this.viewer.imageryLayers.get(0);
    }

    this.viewer.scene.globe.depthTestAgainstTerrain = true;

    this.setupEvents();
    return this.viewer;
  }

  public getViewer() {
    return this.viewer;
  }

  /* ---------------------------------------------------------------- */
  /*  Events                                                            */
  /* ---------------------------------------------------------------- */

  private setupEvents() {
    if (!this.viewer) return;

    this.eventHandler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);

    this.eventHandler.setInputAction(
      (movement: ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = this.viewer?.scene.pick(movement.position);
        if (picked) this.handleFeatureSelect(picked);
        else this.clearSelection();
      },
      ScreenSpaceEventType.LEFT_CLICK,
    );

    this.eventHandler.setInputAction(() => {
      // hover placeholder
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }

  private handleFeatureSelect(feature: PickedFeature) {
    this.clearSelection();
    this.selectedFeature = feature;
    if (feature.color) {
      feature.originalColor = feature.color.clone();
      feature.color = Color.YELLOW.withAlpha(0.5);
    }
  }

  private clearSelection() {
    if (this.selectedFeature?.color && this.selectedFeature?.originalColor) {
      this.selectedFeature.color = this.selectedFeature.originalColor;
    }
    this.selectedFeature = null;
  }

  /* ---------------------------------------------------------------- */
  /*  3-D Tilesets                                                      */
  /* ---------------------------------------------------------------- */

  public async addTileset(
    options: TilesetOptions,
  ): Promise<Cesium3DTileset | null> {
    if (!this.viewer) return null;
    try {
      const resource: IonResource | string | undefined = options.assetId
        ? await IonResource.fromAssetId(options.assetId)
        : await options.url;
      if (!resource) throw new Error("No URL or AssetId provided");
      const tileset = await Cesium3DTileset.fromUrl(resource, {
        show: options.show ?? true,
      });
      this.viewer.scene.primitives.add(tileset);
      this.tilesets.set(options.id, tileset);
      return tileset;
    } catch (err) {
      console.error(`[CesiumManager] addTileset "${options.id}":`, err);
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

  public setTilesetVisibility(id: string, visible: boolean) {
    const tileset = this.tilesets.get(id);
    if (tileset) tileset.show = visible;
  }

  /* ---------------------------------------------------------------- */
  /*  Camera                                                            */
  /* ---------------------------------------------------------------- */

  public async flyToTileset(id: string) {
    const tileset = this.tilesets.get(id);
    if (tileset && this.viewer) return this.viewer.zoomTo(tileset);
  }

  public flyToCoordinates(
    longitude: number,
    latitude: number,
    height = 5000,
    duration = 2.0,
  ) {
    if (!this.viewer) return;
    this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(longitude, latitude, height),
      duration,
    });
  }

  public flyTo(options: FlyToOptions) {
    if (!this.viewer) return;
    this.viewer.camera.flyTo({
      destination: options.destination ?? Cartesian3.fromDegrees(0, 0, 1000),
      orientation: options.orientation,
      duration: options.duration ?? 2.0,
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Terrain / DTM                                                     */
  /* ---------------------------------------------------------------- */

  /**
   * Apply a DTM option to the viewer's terrain provider.
   * Falls back to Ellipsoid on any error.
   */
  public async setDTMTerrain(option: DTMOption): Promise<void> {
    if (!this.viewer) return;
    try {
      switch (option.type) {
        case "ellipsoid":
          this.viewer.terrainProvider = new EllipsoidTerrainProvider();
          break;
        case "ion":
          this.viewer.terrainProvider = await createWorldTerrainAsync({
            requestVertexNormals: true,
            requestWaterMask: true,
          });
          break;
        case "arcgis":
          if (option.url) {
            this.viewer.terrainProvider =
              await ArcGISTiledElevationTerrainProvider.fromUrl(option.url);
          }
          break;
        case "custom":
          if (option.url) {
            this.viewer.terrainProvider = await CesiumTerrainProvider.fromUrl(
              option.url,
              {
                requestVertexNormals: true,
              },
            );
          }
          break;
      }
    } catch (err) {
      console.error(`[CesiumManager] setDTMTerrain "${option.id}":`, err);
      this.viewer.terrainProvider = new EllipsoidTerrainProvider();
    }
  }

  /** Convenience: flat ellipsoid with no terrain. */
  public disableTerrain(): void {
    if (!this.viewer) return;
    this.viewer.terrainProvider = new EllipsoidTerrainProvider();
  }

  /** Convenience: Cesium World Terrain via Ion. */
  public async enableTerrain(): Promise<void> {
    if (!this.viewer) return;
    this.viewer.terrainProvider = await createWorldTerrainAsync();
  }

  /* ---------------------------------------------------------------- */
  /*  XYZ Basemap                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * Apply an XYZ tile basemap.
   * Hides the Cesium default imagery (preserves it for later restore)
   * and inserts our layer at index 0.
   */
  public setXYZBasemap(options: XYZBasemapOptions): void {
    if (!this.viewer) return;

    // Remove any previously injected XYZ layer
    if (this.activeBasemapLayer) {
      this.viewer.imageryLayers.remove(this.activeBasemapLayer, true);
      this.activeBasemapLayer = null;
    }

    // Hide (don't destroy) the Cesium default so it can be restored
    if (this.defaultImageryLayer) {
      this.defaultImageryLayer.show = false;
    }

    const provider = new UrlTemplateImageryProvider({
      url: options.url,
      subdomains: options.subdomains,
      credit: options.credit ?? "",
      minimumLevel: options.minimumLevel ?? 0,
      maximumLevel: options.maximumLevel ?? 19,
    });

    // Add at position 0 (underneath any tileset overlays)
    this.activeBasemapLayer = this.viewer.imageryLayers.addImageryProvider(
      provider,
      0,
    );
  }

  /**
   * Remove the active XYZ basemap and restore Cesium's default imagery.
   */
  public removeBasemap(): void {
    if (!this.viewer) return;

    if (this.activeBasemapLayer) {
      this.viewer.imageryLayers.remove(this.activeBasemapLayer, true);
      this.activeBasemapLayer = null;
    }

    // Restore the saved default imagery layer
    if (this.defaultImageryLayer) {
      this.defaultImageryLayer.show = true;
    }
  }

  /* ---------------------------------------------------------------- */
  /*  OrthoPhoto Overlays                                               */
  /* ---------------------------------------------------------------- */

  /**
   * Add an XYZ orthophoto overlay on top of the basemap.
   * Multiple overlays can be active simultaneously.
   */
  public addOrthoPhoto(option: OrthoPhotoOption): void {
    if (!this.viewer) return;
    // Don't add duplicates
    if (this.overlayLayers.has(option.id)) return;

    const provider = new UrlTemplateImageryProvider({
      url: option.url,
      subdomains: option.subdomains,
      credit: option.credit ?? "",
      minimumLevel: option.minimumLevel ?? 0,
      maximumLevel: option.maximumLevel ?? 19,
    });

    const layer = this.viewer.imageryLayers.addImageryProvider(provider);
    layer.alpha = option.alpha ?? 1.0;
    this.overlayLayers.set(option.id, layer);
  }

  /** Remove a single orthophoto overlay by id. */
  public removeOrthoPhoto(id: string): void {
    if (!this.viewer) return;
    const layer = this.overlayLayers.get(id);
    if (layer) {
      this.viewer.imageryLayers.remove(layer, true);
      this.overlayLayers.delete(id);
    }
  }

  /** Toggle visibility of an orthophoto overlay. */
  public setOrthoPhotoVisibility(id: string, visible: boolean): void {
    const layer = this.overlayLayers.get(id);
    if (layer) layer.show = visible;
  }

  /** Set opacity of an orthophoto overlay (0–1). */
  public setOrthoPhotoAlpha(id: string, alpha: number): void {
    const layer = this.overlayLayers.get(id);
    if (layer) layer.alpha = alpha;
  }

  /** Remove all orthophoto overlays. */
  public clearOrthoPhotos(): void {
    if (!this.viewer) return;
    for (const [id, layer] of this.overlayLayers) {
      this.viewer.imageryLayers.remove(layer, true);
      this.overlayLayers.delete(id);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Legacy helper                                                     */
  /* ---------------------------------------------------------------- */

  public addImageryProvider(
    provider: Parameters<
      NonNullable<
        CesiumManager["viewer"]
      >["imageryLayers"]["addImageryProvider"]
    >[0],
  ): ImageryLayer | null {
    if (!this.viewer) return null;
    return this.viewer.imageryLayers.addImageryProvider(provider);
  }

  /* ---------------------------------------------------------------- */
  /*  Destroy                                                           */
  /* ---------------------------------------------------------------- */

  public destroy() {
    this.eventHandler?.destroy();
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
    this.tilesets.clear();
    this.overlayLayers.clear();
  }
}
