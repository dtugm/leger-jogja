"use client";

import { useEffect } from "react";
import { useMap } from "./maplibre-map";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";

/**
 * Register PMTiles protocol for MapLibre
 * Call this once at the top level or inside a hook
 */
export const registerPMTiles = () => {
    try {
        let protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
    } catch (e) {
        // Protocol already registered or other error
    }
};

// ─── GeoJSON Layer ────────────────────────────────────────────────────────────

interface GeoJSONLayerProps {
    id: string;
    data: any;
    type?: "fill" | "line" | "circle" | "symbol";
    paint?: any;
    layout?: any;
    cluster?: boolean;
    clusterMaxZoom?: number;
    clusterRadius?: number;
}

export function GeoJSONLayer({
    id,
    data,
    type = "circle",
    paint = {},
    layout = {},
    cluster = false,
    clusterMaxZoom = 14,
    clusterRadius = 50,
}: GeoJSONLayerProps) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const sourceId = `${id}-source`;
        const layerId = `${id}-layer`;

        // Add Source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: "geojson",
                data: data,
                cluster: cluster,
                clusterMaxZoom: clusterMaxZoom,
                clusterRadius: clusterRadius,
            });

            // Add Layer
            map.addLayer({
                id: layerId,
                type: type,
                source: sourceId,
                paint: paint,
                layout: layout,
            } as any);

            // If clustering is enabled, add cluster layers (circles + counts)
            if (cluster && type === "circle") {
                map.addLayer({
                    id: `${id}-clusters`,
                    type: "circle",
                    source: sourceId,
                    filter: ["has", "point_count"],
                    paint: {
                        "circle-color": [
                            "step",
                            ["get", "point_count"],
                            "#51bbd6",
                            100,
                            "#f1f075",
                            750,
                            "#f28cb1",
                        ],
                        "circle-radius": [
                            "step",
                            ["get", "point_count"],
                            20,
                            100,
                            30,
                            750,
                            40,
                        ],
                    },
                });

                map.addLayer({
                    id: `${id}-cluster-count`,
                    type: "symbol",
                    source: sourceId,
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12,
                    },
                });

                // Add click handler for clusters to zoom in
                map.on('click', `${id}-clusters`, (e) => {
                    const features = map.queryRenderedFeatures(e.point, {
                        layers: [`${id}-clusters`]
                    });
                    const clusterId = features[0].properties.cluster_id;
                    const source: any = map.getSource(sourceId);
                    source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
                        if (err) return;
                        map.easeTo({
                            center: (features[0].geometry as any).coordinates,
                            zoom: zoom
                        });
                    });
                });
            }
        }

        return () => {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getLayer(`${id}-clusters`)) map.removeLayer(`${id}-clusters`);
            if (map.getLayer(`${id}-cluster-count`)) map.removeLayer(`${id}-cluster-count`);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, data, cluster]);

    return null;
}

// ─── Vector Layer (MVT/MBTiles/PMTiles) ───────────────────────────────────────

interface VectorLayerProps {
    id: string;
    url: string; // "pmtiles://..." or "https://..."
    sourceLayer: string;
    type: "fill" | "line" | "circle" | "symbol";
    paint?: any;
    layout?: any;
}

export function VectorLayer({
    id,
    url,
    sourceLayer,
    type,
    paint = {},
    layout = {},
}: VectorLayerProps) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const sourceId = `${id}-source`;
        const layerId = `${id}-layer`;

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: "vector",
                url: url,
            });

            map.addLayer({
                id: layerId,
                type: type,
                source: sourceId,
                "source-layer": sourceLayer,
                paint: paint,
                layout: layout,
            } as any);
        }

        return () => {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, url, sourceLayer]);

    return null;
}

// ─── Raster Layer (XYZ/Tiles) ─────────────────────────────────────────────────

interface RasterLayerProps {
    id: string;
    url: string; // "https://.../{z}/{x}/{y}"
    tileSize?: number;
    opacity?: number;
    beforeId?: string; // ID of layer to insert before
}

export function RasterLayer({
    id,
    url,
    tileSize = 256,
    opacity = 1,
    beforeId,
}: RasterLayerProps) {
    const { map } = useMap();

    useEffect(() => {
        if (!map) return;

        const sourceId = `${id}-source`;
        const layerId = `${id}-layer`;

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: "raster",
                tiles: [url],
                tileSize: tileSize,
            });

            map.addLayer(
                {
                    id: layerId,
                    type: "raster",
                    source: sourceId,
                    paint: {
                        "raster-opacity": opacity,
                    },
                } as any,
                beforeId
            );
        }

        return () => {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, url, opacity, beforeId]);

    return null;
}

// ─── SHP Support ──────────────────────────────────────────────────────────────

/**
 * Loads and parses a .shp (as zip) or individual shp components into GeoJSON
 * @param url URL to a .zip containing .shp, .dbf, etc.
 * @returns GeoJSON object
 */
export async function loadShp(url: string): Promise<any> {
    try {
        // @ts-ignore
        const shp = (await import("shpjs")).default;
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return await shp(buffer);
    } catch (error) {
        console.error("Failed to load/parse SHP:", error);
        return null;
    }
}

