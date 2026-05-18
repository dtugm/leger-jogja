"use client";

import type { Map } from "maplibre-gl";
import { Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Asset } from "@/components/catalog/asset-table";
import AssetMapLayer, { type AssetGeoJSON } from "@/components/maplibre/asset-map-layer";
import MaplibreMap from "@/components/maplibre/maplibre-map";

// ─── Constants ────────────────────────────────────────────────────────────────

const INDONESIA_CENTER: [number, number] = [117.0, -2.5];
const INDONESIA_ZOOM = 4.5;
const BASEMAP = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assetsToGeoJSON(assets: Asset[]): AssetGeoJSON {
  return {
    type: "FeatureCollection",
    features: assets
      .filter((a): a is Asset & { coordinates: [number, number] } =>
        Array.isArray(a.coordinates) && a.coordinates.length === 2
      )
      .map((a) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: a.coordinates },
        properties: {
          id: a.id,
          name: a.name,
          type: a.type,
          location: a.location,
          condition: a.condition,
          length: a.length,
          lastInspection: a.lastInspection,
          lng: a.coordinates[0],
          lat: a.coordinates[1],
        },
      })),
  };
}

function computeCenter(assets: Asset[]): [number, number] {
  const withCoords = assets.filter((a) => Array.isArray(a.coordinates));
  if (!withCoords.length) return INDONESIA_CENTER;
  const total = withCoords.reduce(
    (acc, a) => ({ lng: acc.lng + a.coordinates![0], lat: acc.lat + a.coordinates![1] }),
    { lng: 0, lat: 0 }
  );
  return [total.lng / withCoords.length, total.lat / withCoords.length];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CatalogMapProps {
  assets: Asset[];
  /** Normal-mode map height. Ignored when fullscreen. */
  height?: string;
}

// ─── Sub-component: expand button ─────────────────────────────────────────────

interface ExpandButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

function ExpandButton({ isFullscreen, onToggle }: ExpandButtonProps) {
  return (
    <button
      onClick={onToggle}
      title={isFullscreen ? "Exit fullscreen (Esc)" : "Expand map to fullscreen"}
      aria-label={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
      className="
        flex items-center justify-center
        w-7 h-7 rounded-md
        text-muted-foreground
        hover:text-foreground hover:bg-muted
        transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
      "
    >
      {isFullscreen
        ? <Minimize2 className="w-4 h-4" />
        : <Maximize2 className="w-4 h-4" />
      }
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CatalogMap({ assets, height = "400px" }: CatalogMapProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hold native MapLibre Map instance so we can call resize() after layout change
  const mapInstanceRef = useRef<Map | null>(null);

  const geoJSON = useMemo(() => assetsToGeoJSON(assets), [assets]);
  const center  = useMemo(() => computeCenter(assets),   [assets]);

  // ── ESC key exits fullscreen ─────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  // ── Lock body scroll while fullscreen ────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  // ── Notify MapLibre of container resize after CSS settles ─────────────────
  // Two ticks: one for React to commit the new class, one for the browser to
  // re-paint — then resize() recalculates the canvas dimensions.
  useEffect(() => {
    const id = setTimeout(() => mapInstanceRef.current?.resize(), 80);
    return () => clearTimeout(id);
  }, [isFullscreen]);

  const handleDetailClick = (assetId: string) => {
    router.push(`/catalog/${assetId}`);
  };

  const toggleFullscreen = () => setIsFullscreen((v) => !v);

  // ── Dynamic classes ───────────────────────────────────────────────────────
  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-background"
    : "w-full rounded-xl overflow-hidden border border-border shadow-sm";

  const mapHeight = isFullscreen ? "100%" : height;

  return (
    <div className={wrapperClass}>
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border flex-shrink-0">
        {/* Left: title + count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Asset Map</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {geoJSON.features.length} titik
          </span>
          {isFullscreen && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              · Tekan <kbd className="font-mono bg-muted border border-border rounded px-1 py-0.5 text-[10px]">Esc</kbd> untuk keluar
            </span>
          )}
        </div>

        {/* Right: legend + expand button */}
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            {(["Good", "Fair", "Poor"] as const).map((cond) => (
              <span key={cond} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background:
                      cond === "Good" ? "#22c55e"
                      : cond === "Fair" ? "#f59e0b"
                      : "#ef4444",
                  }}
                />
                {cond}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-400" />
              Cluster
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-4 bg-border" />

          {/* Expand / Collapse button */}
          <ExpandButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
        </div>
      </div>

      {/* ── Map canvas ──────────────────────────────────────────────────── */}
      <div className={isFullscreen ? "flex-1 min-h-0" : ""}>
        <MaplibreMap
          id="catalog-asset-map"
          mapStyle={BASEMAP}
          center={center}
          zoom={INDONESIA_ZOOM}
          height={mapHeight}
          onMapLoad={(m) => { mapInstanceRef.current = m; }}
        >
          <AssetMapLayer
            id="catalog-assets"
            data={geoJSON}
            cluster={true}
            clusterMaxZoom={12}
            clusterRadius={60}
            onDetailClick={handleDetailClick}
          />
        </MaplibreMap>
      </div>
    </div>
  );
}
