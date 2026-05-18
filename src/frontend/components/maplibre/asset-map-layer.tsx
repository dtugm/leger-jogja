"use client";

import maplibregl, { GeoJSONSource } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { useMap } from "@/components/maplibre/maplibre-map";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssetFeatureProperties {
  id: string;
  name: string;
  type: string;
  location: string;
  condition: "Good" | "Fair" | "Poor";
  length: string;
  lastInspection: string;
  /** Stored separately so popup can access them without needing geometry */
  lng: number;
  lat: number;
}

export type AssetGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  AssetFeatureProperties
>;

export interface AssetMapLayerProps {
  /** Unique layer namespace — must be stable across renders */
  id: string;
  /** GeoJSON FeatureCollection of assets. Use useMemo on the parent side. */
  data: AssetGeoJSON;
  /** Called with the asset ID when the user clicks "Detail" in the popup */
  onDetailClick?: (assetId: string) => void;
  /** Enable clustering (default: true) */
  cluster?: boolean;
  /** Max zoom level at which clusters are rendered (default: 14) */
  clusterMaxZoom?: number;
  /** Radius of cluster (default: 50) */
  clusterRadius?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Dot colors per condition status */
const CONDITION_COLOR: Record<string, string> = {
  Good: "#22c55e",
  Fair: "#f59e0b",
  Poor: "#ef4444",
};

const CONDITION_DOT_HTML: Record<string, string> = {
  Good: `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;"></span>`,
  Fair: `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0;"></span>`,
  Poor: `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;flex-shrink:0;"></span>`,
};

// Layer IDs (derived from the namespace)
const layerIds = (id: string) => ({
  source:       `${id}-source`,
  points:       `${id}-points`,
  clusters:     `${id}-clusters`,
  clusterCount: `${id}-cluster-count`,
});

// ─── Popup HTML factory ───────────────────────────────────────────────────────

function buildPopupHTML(props: AssetFeatureProperties): string {
  const conditionDot = CONDITION_DOT_HTML[props.condition] ?? CONDITION_DOT_HTML.Fair;
  return `
    <div style="font-family:inherit;min-width:220px;padding:2px 0;">
      <p style="font-weight:700;font-size:13px;color:var(--foreground,#0f172a);margin:0 0 6px 0;line-height:1.3;">
        ${props.name}
      </p>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;">
        <span style="background:var(--muted,#f1f5f9);color:var(--muted-foreground,#64748b);padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500;">
          ${props.type}
        </span>
        <span style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--muted-foreground,#64748b);">
          ${conditionDot}
          ${props.condition}
        </span>
      </div>
      <p style="font-size:12px;color:var(--muted-foreground,#64748b);margin:0 0 2px 0;">
        📍 ${props.location}
      </p>
      <div style="margin:8px 0;border-top:1px solid var(--border,#e2e8f0);padding-top:8px;font-size:11px;color:var(--muted-foreground,#94a3b8);line-height:1.8;">
        <div style="display:flex;justify-content:space-between;">
          <span>Longitude</span>
          <span style="font-weight:600;color:var(--foreground,#0f172a);font-family:monospace;">${props.lng.toFixed(6)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Latitude</span>
          <span style="font-weight:600;color:var(--foreground,#0f172a);font-family:monospace;">${props.lat.toFixed(6)}</span>
        </div>
      </div>
      <button
        id="asset-popup-detail-btn"
        data-asset-id="${props.id}"
        style="width:100%;background:#6366f1;color:#fff;border:none;border-radius:7px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.02em;transition:background 0.15s;"
        onmouseover="this.style.background='#4f46e5'"
        onmouseout="this.style.background='#6366f1'"
      >
        Lihat Detail →
      </button>
    </div>
  `;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssetMapLayer({
  id,
  data,
  onDetailClick,
  cluster = true,
  clusterMaxZoom = 14,
  clusterRadius = 50,
}: AssetMapLayerProps) {
  const { map } = useMap();

  // Keep latest callback in a ref so event handlers always access fresh value
  const onDetailClickRef = useRef(onDetailClick);
  onDetailClickRef.current = onDetailClick;

  // Keep active popup in a ref for cleanup
  const activePopupRef = useRef<maplibregl.Popup | null>(null);

  // ─── Effect 1: Layer / Source lifecycle ─────────────────────────────────────
  // Runs once per map instance + config change (cluster toggle etc.)
  // Does NOT depend on `data` — data updates are handled separately below.
  useEffect(() => {
    if (!map) return;

    const ids = layerIds(id);

    // ── Helper: build all layers (also called on styledata re-fire) ──────────
    const buildLayers = () => {
      // Guard: source already registered (e.g. styledata fired twice)
      if (map.getSource(ids.source)) return;

      // 1. Source (initial data doesn't matter; setData() will keep it fresh)
      map.addSource(ids.source, {
        type: "geojson",
        data: data,
        cluster,
        clusterMaxZoom,
        clusterRadius,
      });

      // 2. Individual points (non-clustered) — condition-based color
      map.addLayer({
        id: ids.points,
        type: "circle",
        source: ids.source,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-color": [
            "match",
            ["get", "condition"],
            "Good", CONDITION_COLOR.Good,
            "Fair", CONDITION_COLOR.Fair,
            "Poor", CONDITION_COLOR.Poor,
            /* default */ "#6366f1",
          ],
          "circle-opacity": 0.95,
        },
      });

      if (cluster) {
        // 3. Cluster circle — graduated indigo/purple scale
        map.addLayer({
          id: ids.clusters,
          type: "circle",
          source: ids.source,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#818cf8",   // indigo-400 (< 5)
              5,  "#6366f1",   // indigo-500 (5–19)
              20, "#4f46e5",   // indigo-600 (≥ 20)
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              22,
              5,  30,
              20, 38,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "rgba(99,102,241,0.25)",
            "circle-opacity": 0.9,
          },
        });

        // 4. Cluster count label
        map.addLayer({
          id: ids.clusterCount,
          type: "symbol",
          source: ids.source,
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 13,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });
      }
    };

    buildLayers();
    map.on("styledata", buildLayers);

    // ── Cluster click → zoom in ──────────────────────────────────────────────
    const handleClusterClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [ids.clusters] });
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource(ids.source) as GeoJSONSource;
      (source as any).getClusterExpansionZoom(clusterId, (err: unknown, zoom: number) => {
        if (err) return;
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom });
      });
    };

    // ── Individual point click → popup ───────────────────────────────────────
    const handlePointClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [ids.points] });
      if (!features.length) return;

      const props = features[0].properties as AssetFeatureProperties;
      const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];

      // Close previous popup if open
      activePopupRef.current?.remove();

      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: "280px",
        className: "asset-map-popup",
      })
        .setLngLat(coords)
        .setHTML(buildPopupHTML(props))
        .addTo(map);

      activePopupRef.current = popup;

      // Attach detail button listener after popup DOM is rendered
      popup.once("open", () => {
        const btn = document.getElementById("asset-popup-detail-btn");
        if (btn) {
          btn.addEventListener("click", () => {
            const assetId = btn.getAttribute("data-asset-id");
            if (assetId) onDetailClickRef.current?.(assetId);
          });
        }
      });
    };

    // Cursor feedback
    const setCursorPointer  = () => { map.getCanvas().style.cursor = "pointer"; };
    const setCursorDefault  = () => { map.getCanvas().style.cursor = "";        };

    if (cluster) {
      map.on("click",     ids.clusters, handleClusterClick);
      map.on("mouseenter", ids.clusters, setCursorPointer);
      map.on("mouseleave", ids.clusters, setCursorDefault);
    }

    map.on("click",     ids.points, handlePointClick);
    map.on("mouseenter", ids.points, setCursorPointer);
    map.on("mouseleave", ids.points, setCursorDefault);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      map.off("styledata", buildLayers);

      if (cluster) {
        map.off("click",      ids.clusters, handleClusterClick);
        map.off("mouseenter", ids.clusters, setCursorPointer);
        map.off("mouseleave", ids.clusters, setCursorDefault);
      }

      map.off("click",      ids.points, handlePointClick);
      map.off("mouseenter", ids.points, setCursorPointer);
      map.off("mouseleave", ids.points, setCursorDefault);

      activePopupRef.current?.remove();
      activePopupRef.current = null;

      if (map.getLayer(ids.clusterCount)) map.removeLayer(ids.clusterCount);
      if (map.getLayer(ids.clusters))     map.removeLayer(ids.clusters);
      if (map.getLayer(ids.points))       map.removeLayer(ids.points);
      if (map.getSource(ids.source))      map.removeSource(ids.source);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, id, cluster, clusterMaxZoom, clusterRadius]);

  // ─── Effect 2: Reactive data update (no layer teardown) ─────────────────────
  // Uses setData() so WebGL tiles update in-place — no flickering, no re-build.
  useEffect(() => {
    if (!map) return;
    const source = map.getSource(layerIds(id).source) as GeoJSONSource | undefined;
    source?.setData(data);
  }, [map, id, data]);

  return null;
}
