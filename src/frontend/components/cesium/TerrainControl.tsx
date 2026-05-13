"use client";

import { ChevronLeft, ChevronRight, Mountain } from "lucide-react";
import { useState } from "react";

import type { DTMOption } from "@/lib/cesium/types";
import { useMainViewerStore } from "@/store/mainViewer.store";

/* ------------------------------------------------------------------ */
/*  Terrain option definitions                                          */
/*                                                                      */
/*  ★  EDIT HERE to add / remove terrain sources.                       */
/*  ★  For bucket-hosted terrain, use type: "custom" and provide the    */
/*     URL pointing to the root of the quantized-mesh tileset (the      */
/*     folder containing layer.json).                                   */
/* ------------------------------------------------------------------ */

interface TerrainOption {
  /** Store key — "flat" is the sentinel for null/default (no terrain). */
  id: string;
  label: string;
  /**
   * null → flat ellipsoid (no elevation data).
   * non-null → apply this DTM terrain provider.
   */
  config: DTMOption | null;
}

export const TERRAIN_OPTIONS: TerrainOption[] = [
  {
    id: "diy-2023",
    label: "DIY 2023",
    config: {
      id: "diy-2023",
      name: "DIY 2023",
      description: "8m DEM from BIG for DIY province",
      type: "custom",
      url: "https://bucket.dt-heritage.geo-ai.id/DTM/DIY/2023",
    },
  },
  {
    id: "flat",
    label: "Flat",
    config: null,
  },
  {
    id: "cesium-world-terrain",
    label: "World Terrain",
    config: {
      id: "cesium-world-terrain",
      name: "Cesium World Terrain",
      description: "Global high-resolution terrain via Cesium Ion",
      type: "ion",
    },
  },

  // ──────────────────────────────────────────────────────────────────
  //  Add your bucket-hosted terrain sources below.
  //  Example:
  //
  //  {
  //    id: "demnas-diy",
  //    label: "DEMNAS DIY",
  //    config: {
  //      id: "demnas-diy",
  //      name: "DEMNAS DIY",
  //      description: "8m DEM from BIG for DIY province",
  //      type: "custom",
  //      url: "https://storage.googleapis.com/your-bucket/terrain/demnas-diy",
  //    },
  //  },
  // ──────────────────────────────────────────────────────────────────
];

/* ------------------------------------------------------------------ */
/*  Micro SVG thumbnails                                                */
/* ------------------------------------------------------------------ */

/** Flat plane — represents no terrain / ellipsoid. */
function FlatThumb() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
      <rect width="32" height="32" fill="#e8edf5" />
      <line
        x1="0"
        y1="22"
        x2="32"
        y2="22"
        stroke="#94a8c4"
        strokeWidth="1.2"
      />
      <rect x="0" y="22" width="32" height="10" fill="#dce6f5" />
      {/* Grid lines */}
      <line
        x1="0"
        y1="26"
        x2="32"
        y2="26"
        stroke="#c8d4e8"
        strokeWidth="0.4"
      />
      <line
        x1="8"
        y1="22"
        x2="8"
        y2="32"
        stroke="#c8d4e8"
        strokeWidth="0.4"
      />
      <line
        x1="16"
        y1="22"
        x2="16"
        y2="32"
        stroke="#c8d4e8"
        strokeWidth="0.4"
      />
      <line
        x1="24"
        y1="22"
        x2="24"
        y2="32"
        stroke="#c8d4e8"
        strokeWidth="0.4"
      />
    </svg>
  );
}

/** Mountain silhouette — represents Cesium World Terrain. */
function WorldTerrainThumb() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="wt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a90d9" />
          <stop offset="100%" stopColor="#87ceeb" />
        </linearGradient>
        <linearGradient id="wt-mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b8f71" />
          <stop offset="100%" stopColor="#3d5c3f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="url(#wt-sky)" />
      {/* Mountain range */}
      <path
        d="M0 32 L4 20 L8 24 L14 10 L18 16 L22 8 L26 14 L30 12 L32 18 L32 32 Z"
        fill="url(#wt-mtn)"
      />
      {/* Snow caps */}
      <path
        d="M14 10 L12.5 13 L15.5 13 Z"
        fill="white"
        opacity="0.7"
      />
      <path
        d="M22 8 L20.5 11 L23.5 11 Z"
        fill="white"
        opacity="0.7"
      />
    </svg>
  );
}

/** Custom terrain — brownish relief pattern for bucket sources. */
function CustomTerrainThumb() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="ct-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4a882" />
          <stop offset="100%" stopColor="#8b6b4a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="url(#ct-g)" />
      {/* Contour lines */}
      <path
        d="M0 26 Q8 22 16 24 Q24 26 32 22"
        stroke="#a08060"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M0 20 Q10 16 18 18 Q26 20 32 16"
        stroke="#a08060"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M0 14 Q12 10 20 12 Q28 14 32 10"
        stroke="#a08060"
        strokeWidth="0.5"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

/**
 * Map of option id → thumbnail component.
 * Falls back to CustomTerrainThumb for any bucket terrain entries you add.
 */
const THUMBS: Record<string, React.FC> = {
  flat: FlatThumb,
  "cesium-world-terrain": WorldTerrainThumb,
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Collapsible terrain-switcher panel.
 * Positioned alongside BasemapControl on the right side of the viewer.
 * Collapsed by default — shows only a toggle tab.
 */
export function TerrainControl() {
  const { activeDTM, setActiveDTM } = useMainViewerStore();
  const [open, setOpen] = useState(false);

  /** The sentinel id for flat ellipsoid (null in the store). */
  const activeId: string = activeDTM?.id ?? "flat";

  return (
    <div className="flex items-center">
      {/* ── Toggle tab (always visible, on the left edge of the panel) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Collapse terrain panel" : "Expand terrain panel"}
        title="Terrain"
        className="flex flex-col items-center justify-center gap-1 w-6 h-16 rounded-l-lg bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-r-0 border-slate-200 dark:border-slate-700 shadow-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        {open ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
        <Mountain className="w-3 h-3" />
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
            <Mountain
              className="w-3.5 h-3.5 text-slate-400"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Terrain
            </span>
          </div>

          {/* Option rows */}
          <div className="flex flex-col max-h-52 overflow-y-auto">
            {TERRAIN_OPTIONS.map((option) => {
              const isActive = option.id === activeId;
              const Thumb = THUMBS[option.id] ?? CustomTerrainThumb;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveDTM(option.config)}
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
                    <Thumb />
                  </div>

                  {/* Label */}
                  <span
                    className={[
                      "text-xs font-medium flex-1 min-w-0 truncate",
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
