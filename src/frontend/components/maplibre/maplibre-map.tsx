"use client";

import maplibregl, { Map, StyleSpecification } from "maplibre-gl";
import React, { createContext, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────

interface MapContextType {
    map: Map | null;
}

const MapContext = createContext<MapContextType>({ map: null });

export const useMap = () => useContext(MapContext);

// ─── Component Props ──────────────────────────────────────────────────────────

export interface MaplibreMapProps {
    /** Unique ID for container div */
    id?: string;
    /** Initial Center [lng, lat] */
    center?: [number, number];
    /** Initial Zoom level */
    zoom?: number;
    /** Style URL or StyleSpecification object */
    mapStyle?: string | StyleSpecification;
    /** Container height */
    height?: string;
    /** Container width */
    width?: string;
    /** Callback when map is ready */
    onMapLoad?: (map: Map) => void;
    /** Extra className */
    className?: string;
    /** Overlay components */
    children?: React.ReactNode;
}

// ─── Default Values ───────────────────────────────────────────────────────────

const DEFAULT_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const DEFAULT_PROPS = {
    center: [110.3671, -7.7956] as [number, number], // Yogyakarta
    zoom: 12,
    height: "100%",
    width: "100%",
};

// ─── Utils ────────────────────────────────────────────────────────────────────

/**
 * Converts XYZ tile URL to a minimal MapLibre style object if needed
 */
const formatStyle = (style: string | StyleSpecification): string | StyleSpecification => {
    if (typeof style === "string" && style.includes("{x}")) {
        return {
            version: 8,
            sources: {
                "raster-tiles": {
                    type: "raster",
                    tiles: [style],
                    tileSize: 256,
                },
            },
            layers: [
                {
                    id: "raster-layer",
                    type: "raster",
                    source: "raster-tiles",
                    minzoom: 0,
                    maxzoom: 22,
                },
            ],
        };
    }
    return style;
};

// ─── Component ────────────────────────────────────────────────────────────────

const MaplibreMap = React.forwardRef<Map | null, MaplibreMapProps>(({
    id = "maplibre-map",
    center = DEFAULT_PROPS.center,
    zoom = DEFAULT_PROPS.zoom,
    mapStyle = DEFAULT_STYLE,
    height = DEFAULT_PROPS.height,
    width = DEFAULT_PROPS.width,
    onMapLoad,
    className = "",
    children
}, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<Map | null>(null);
    const mapRef = useRef<Map | null>(null);

    // Initial load
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const m = new maplibregl.Map({
            container: mapContainerRef.current,
            style: formatStyle(mapStyle),
            center: center,
            zoom: zoom,
        });

        m.addControl(new maplibregl.NavigationControl(), "top-right");

        m.on("load", () => {
            setMap(m);
            mapRef.current = m;
            onMapLoad?.(m);
        });

        return () => {
            m.remove();
            mapRef.current = null;
            setMap(null);
        };
    }, []);

    // Reactive Style Update
    useEffect(() => {
        if (map && mapStyle) {
            map.setStyle(formatStyle(mapStyle));
        }
    }, [map, mapStyle]);

    // Reactive Zoom/Center (Optional - can be jittery if not handled carefully, but requested for "easy to use")
    useEffect(() => {
        if (map) {
            const currentCenter = map.getCenter();
            if (currentCenter.lng !== center[0] || currentCenter.lat !== center[1]) {
                map.flyTo({ center, speed: 1.5 });
            }
        }
    }, [map, center]);

    useEffect(() => {
        if (map) {
            if (map.getZoom() !== zoom) {
                map.setZoom(zoom);
            }
        }
    }, [map, zoom]);

    useImperativeHandle(ref, () => mapRef.current as Map);

    return (
        <MapContext.Provider value={{ map }}>
            <div className={`relative ${className}`} style={{ width, height }}>
                <div
                    id={id}
                    ref={mapContainerRef}
                    className="w-full h-full"
                />
                {/* Overlay layer for children */}
                {map && (
                    <div className="absolute inset-0 pointer-events-none z-[1]">
                        <div className="pointer-events-none h-full w-full relative">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        </MapContext.Provider>
    );
});

MaplibreMap.displayName = "MaplibreMap";

export default MaplibreMap;
