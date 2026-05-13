"use client";

import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { useState } from "react";

import type { XYZBasemapOptions } from "@/lib/cesium/types";
import { useMainViewerStore } from "@/store/mainViewer.store";

/* ------------------------------------------------------------------ */
/*  Basemap option definitions                                          */
/* ------------------------------------------------------------------ */

interface BasemapOption {
  /** Store key — "cesium-default" is the sentinel for null/default. */
  id: string;
  label: string;
  /**
   * null → remove the XYZ override and restore the Cesium default imagery.
   * non-null → apply this XYZ tile source.
   */
  config: XYZBasemapOptions | null;
}

const BASEMAPS: BasemapOption[] = [
  {
    id: "cesium-default",
    label: "Default",
    config: null,
  },
  {
    id: "osm",
    label: "Streets",
    config: {
      id: "osm",
      name: "Streets",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      credit: "© OpenStreetMap contributors",
      maximumLevel: 19,
    },
  },
  {
    id: "esri-satellite",
    label: "Satellite",
    config: {
      id: "esri-satellite",
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      credit: "© Esri, Maxar, Earthstar Geographics",
      maximumLevel: 19,
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Micro SVG thumbnails                                                */
/* ------------------------------------------------------------------ */

/** Blue sky + green terrain — represents Cesium Ion imagery. */
function CesiumThumb() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a6faf" />
          <stop offset="100%" stopColor="#3b9ddd" />
        </linearGradient>
        <linearGradient id="cs-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a7c2a" />
          <stop offset="100%" stopColor="#2d5010" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="url(#cs-sky)" />
      <rect y="20" width="32" height="12" fill="url(#cs-land)" />
      <ellipse cx="16" cy="20" rx="16" ry="3.5" fill="#7ec8e3" opacity="0.5" />
    </svg>
  );
}

/** Light background with road grid — represents OpenStreetMap. */
function StreetsThumb() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
      <rect width="32" height="32" fill="#f2f0eb" />
      {/* Road corridors */}
      <rect x="13" y="0" width="6" height="32" fill="#e0d9c8" />
      <rect x="0" y="13" width="32" height="6" fill="#e0d9c8" />
      {/* Road centre-lines */}
      <line x1="16" y1="0" x2="16" y2="32" stroke="#c8bfa4" strokeWidth="1" />
      <line x1="0" y1="16" x2="32" y2="16" stroke="#c8bfa4" strokeWidth="1" />
      {/* City blocks */}
      <rect x="1" y="1" width="11" height="11" fill="#e8e4dc" />
      <rect x="20" y="1" width="11" height="11" fill="#e8e4dc" />
      <rect x="1" y="20" width="11" height="11" fill="#e8e4dc" />
      <rect x="20" y="20" width="11" height="11" fill="#e8e4dc" />
    </svg>
  );
}

/** Dark green/brown aerial pattern — represents satellite imagery. */
function SatelliteThumb() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="sat-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2d5016" />
          <stop offset="100%" stopColor="#1a3a0a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="url(#sat-g)" />
      <rect x="0" y="0" width="15" height="15" fill="#3a6a1e" opacity="0.7" />
      <rect x="17" y="17" width="15" height="15" fill="#2d5216" opacity="0.7" />
      <rect x="0" y="17" width="10" height="9" fill="#5a7a32" opacity="0.5" />
      <rect x="20" y="0" width="12" height="10" fill="#486c1a" opacity="0.5" />
      {/* Subtle road lines */}
      <line
        x1="0"
        y1="16"
        x2="32"
        y2="16"
        stroke="#8a7a50"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <line
        x1="16"
        y1="0"
        x2="16"
        y2="32"
        stroke="#8a7a50"
        strokeWidth="0.6"
        opacity="0.6"
      />
    </svg>
  );
}

const THUMBS: Record<string, React.FC> = {
  "cesium-default": CesiumThumb,
  osm: StreetsThumb,
  "esri-satellite": SatelliteThumb,
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Collapsible basemap-switcher panel.
 * Positioned on the left side of the Cesium viewer, vertically centred.
 * Collapsed by default — shows only a toggle tab.
 */
export function BasemapControl() {
  const { activeBasemap, setActiveBasemap } = useMainViewerStore();
  const [open, setOpen] = useState(false);

  /** The sentinel id for the Cesium default (null in the store). */
  const activeId: string = activeBasemap?.id ?? "cesium-default";

  return (
    <div className="flex items-center">
      {/* ── Toggle tab (always visible, on the left edge of the panel) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Collapse basemap panel" : "Expand basemap panel"}
        title="Basemap"
        className="flex flex-col items-center justify-center gap-1 w-6 h-16 rounded-l-lg bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-r-0 border-slate-200 dark:border-slate-700 shadow-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        {open ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
        <Map className="w-3 h-3" />
      </button>

      {/* ── Panel (slides in from the right) ───────────────────── */}
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "w-44 opacity-100" : "w-0 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-44 rounded-l-xl bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-l-0 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <Map className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Basemap
            </span>
          </div>

          {/* Option rows */}
          <div className="flex flex-col">
            {BASEMAPS.map((option) => {
              const isActive = option.id === activeId;
              const Thumb = THUMBS[option.id];

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveBasemap(option.config)}
                  aria-pressed={isActive}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2 text-left w-full transition-colors",
                    "border-b border-slate-50 dark:border-slate-800/50 last:border-0",
                    isActive
                      ? "bg-blue-50/60 dark:bg-blue-950/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40",
                  ].join(" ")}
                >
                  {/* Thumbnail */}
                  <div
                    className={[
                      "w-8 h-8 rounded-md overflow-hidden shrink-0 border",
                      isActive
                        ? "border-blue-400 ring-1 ring-blue-400/60"
                        : "border-slate-200 dark:border-slate-700",
                    ].join(" ")}
                  >
                    {Thumb && <Thumb />}
                  </div>

                  {/* Label */}
                  <span
                    className={[
                      "text-xs font-medium flex-1 min-w-0",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {option.label}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
