"use client";
import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl, { Map, StyleSpecification } from "maplibre-gl";
import { useEffect, useRef } from "react";

export interface MaplibreMapProps {
    /** ID unik untuk container div */
    id?: string;
    /** Longitude awal */
    longitude?: number;
    /** Latitude awal */
    latitude?: number;
    /** Zoom level awal */
    zoom?: number;
    /** Style URL atau StyleSpecification object */
    mapStyle?: string | StyleSpecification;
    /** Tinggi container map */
    height?: string;
    /** Lebar container map */
    width?: string;
    /** Callback saat map sudah siap */
    onMapLoad?: (map: Map) => void;
    /** Tambahan className untuk container */
    className?: string;
}

// ─── Default Values ───────────────────────────────────────────────────────────

const DEFAULT_STYLE =
    "https://demotiles.maplibre.org/style.json"; // free demo tiles

const DEFAULT_PROPS = {
    longitude: 106.8272,  // Jakarta
    latitude: -6.1751,
    zoom: 10,
    height: "500px",
    width: "100%",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MaplibreMap({
    id = "maplibre-map",
    longitude = DEFAULT_PROPS.longitude,
    latitude = DEFAULT_PROPS.latitude,
    zoom = DEFAULT_PROPS.zoom,
    mapStyle = DEFAULT_STYLE,
    height = DEFAULT_PROPS.height,
    width = DEFAULT_PROPS.width,
    onMapLoad,
    className = "",
}: MaplibreMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        // Guard: jangan inisialisasi ulang jika sudah ada
        if (mapRef.current || !mapContainerRef.current) return;

        // Inisialisasi map instance
        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: mapStyle,
            center: [longitude, latitude],
            zoom,
        });

        // Simpan instance ke ref
        mapRef.current = map;

        // Tambahkan navigation control (zoom in/out + compass)
        map.addControl(new maplibregl.NavigationControl(), "top-right");

        // Callback saat map selesai load
        map.on("load", () => {
            onMapLoad?.(map);
        });

        // ── Cleanup saat komponen unmount ──
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div
            id={id}
            ref={mapContainerRef}
            className={className}
            style={{ height, width }}
        />
    );
}
