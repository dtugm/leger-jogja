"use client";

import "cesium/Build/Cesium/Widgets/widgets.css";

import {
  Cartesian3,
  createWorldTerrainAsync,
  ImageryLayer,
  Ion,
  IonImageryProvider,
  IonResource,
  Math as CesiumMath,
  OpenStreetMapImageryProvider,
} from "cesium";
import { useMemo } from "react";
import { CameraFlyTo, Cesium3DTileset, Viewer } from "resium";

import { useMapSettings } from "@/lib/map-settings";

declare global {
  interface Window {
    CESIUM_BASE_URL: string;
  }
}

if (typeof window !== "undefined") {
  window.CESIUM_BASE_URL = "/cesium";

  const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  if (token) {
    Ion.defaultAccessToken = token;
  } else {
    console.warn(
      "Cesium Ion token not found. Set NEXT_PUBLIC_CESIUM_ION_TOKEN environment variable for full functionality.",
    );
  }
}

const INITIAL_POSITION = {
  longitude: 110.377766,
  latitude: -7.779264,
  height: 1000,
};

const INITIAL_DESTINATION = Cartesian3.fromDegrees(
  INITIAL_POSITION.longitude,
  INITIAL_POSITION.latitude,
  INITIAL_POSITION.height,
);

const INITIAL_ORIENTATION = {
  heading: CesiumMath.toRadians(0),
  pitch: CesiumMath.toRadians(-45),
  roll: 0,
};

// OSM Buildings asset ID on Cesium Ion
const OSM_BUILDINGS_ASSET_ID = 96188;

export default function CesiumViewerComponent() {
  const { settings } = useMapSettings();
  const { showBuildings, showOrtho, showRoads } = settings;

  // Base imagery: Cesium Ion default (orthophoto-style) or OSM roads overlay
  const imageryBaseLayer = useMemo(() => {
    if (showOrtho) {
      // Cesium Ion default imagery (Bing/satellite ortho)
      return ImageryLayer.fromProviderAsync(IonImageryProvider.fromAssetId(2));
    }
    // When ortho is off, show OSM as the base (or a minimal base)
    const osmProvider = new OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/",
    });
    return ImageryLayer.fromProviderAsync(Promise.resolve(osmProvider));
  }, [showOrtho]);

  // OSM road overlay layer — shown on top of ortho when roads are enabled
  const roadsOverlayLayer = useMemo(() => {
    if (!showRoads || !showOrtho) return null;
    // Use a transparent OSM overlay (CartoDB Positron or OSM)
    const osmProvider = new OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/",
    });
    const layer = ImageryLayer.fromProviderAsync(Promise.resolve(osmProvider));
    layer.alpha = 0.35;
    return layer;
  }, [showRoads, showOrtho]);

  // OSM Buildings resource
  const osmBuildingsUrl = useMemo(() => {
    return IonResource.fromAssetId(OSM_BUILDINGS_ASSET_ID);
  }, []);

  const terrainProvider = useMemo(() => {
    return createWorldTerrainAsync();
  }, []);

  return (
    <Viewer
      full
      timeline={false}
      animation={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      baseLayerPicker={false}
      navigationHelpButton={false}
      fullscreenButton={false}
      baseLayer={imageryBaseLayer}
      terrainProvider={terrainProvider}
    >
      {roadsOverlayLayer && (
        // buat load jalan
        // @ts-expect-error - ImageryLayer is valid as resium child
        <primitive object={roadsOverlayLayer} />
      )}
      {showBuildings && <Cesium3DTileset url={osmBuildingsUrl} />}
      <CameraFlyTo
        destination={INITIAL_DESTINATION}
        orientation={INITIAL_ORIENTATION}
        duration={0}
        once
      />
    </Viewer>
  );
}
