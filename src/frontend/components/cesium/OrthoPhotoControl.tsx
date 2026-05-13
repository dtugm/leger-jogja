"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  Satellite,
  X,
} from "lucide-react";
import { useState } from "react";

import type { OrthoPhotoOption } from "@/lib/cesium/types";
import { useMainViewerStore } from "@/store/mainViewer.store";

/* ------------------------------------------------------------------ */
/*  OrthoPhoto option definitions                                       */
/*                                                                      */
/*  ★  EDIT HERE to add / remove orthophoto sources.                    */
/*  ★  Each entry is an XYZ tile overlay; multiple can be active at     */
/*     the same time (checkbox behaviour, not radio).                   */
/* ------------------------------------------------------------------ */

export const ORTHOPHOTO_OPTIONS: OrthoPhotoOption[] = [
  // ──────────────────────────────────────────────────────────────────
  //  Add your orthophoto tile sources here.
  //  Example:
  //
  {
    id: "ortho-diy-2023",
    name: "OrthoPhoto DIY 2023",
    url: "https://bucket.dt-heritage.geo-ai.id/ORTHO/DIY/2023/{z}/{x}/{reverseY}.png",
    credit: "© BIG",
    maximumLevel: 20,
    alpha: 0.9,
  },
  // ──────────────────────────────────────────────────────────────────
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Collapsible orthophoto overlay manager.
 * Allows toggling multiple XYZ tile overlays on/off (checkbox style).
 * Positioned alongside BasemapControl and TerrainControl.
 */
export function OrthoPhotoControl() {
  const {
    activeOrthoPhotos,
    addOrthoPhoto,
    removeOrthoPhoto,
    hasOrthoPhoto,
    clearOrthoPhotos,
  } = useMainViewerStore();
  const [open, setOpen] = useState(false);

  const activeCount = activeOrthoPhotos.length;

  return (
    <div className="flex items-center">
      {/* ── Toggle tab ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          open ? "Collapse orthophoto panel" : "Expand orthophoto panel"
        }
        title="OrthoPhoto"
        className="flex flex-col items-center justify-center gap-1 w-6 h-16 rounded-l-lg bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-r-0 border-slate-200 dark:border-slate-700 shadow-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        {open ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
        <Satellite className="w-3 h-3" />
        {activeCount > 0 && (
          <span className="text-[9px] font-bold leading-none text-blue-500">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Panel ──────────────────────────────────────────────── */}
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "w-52 opacity-100" : "w-0 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-52 rounded-l-xl bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-l-0 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Satellite
                className="w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                OrthoPhoto
                {activeCount > 0 && (
                  <span className="ml-1 text-slate-400">({activeCount})</span>
                )}
              </span>
            </div>
            {activeCount > 0 && (
              <button
                onClick={clearOrthoPhotos}
                className="text-[11px] text-slate-400 hover:text-red-500 transition-colors font-medium"
                title="Remove all overlays"
              >
                Clear
              </button>
            )}
          </div>

          {/* Option rows */}
          <div className="flex flex-col max-h-56 overflow-y-auto">
            {ORTHOPHOTO_OPTIONS.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-slate-400 dark:text-slate-600">
                <ImagePlus className="w-5 h-5 opacity-40" />
                <p className="text-xs text-center px-3">
                  No orthophoto sources configured.
                </p>
                <p className="text-[10px] text-center px-3 opacity-70">
                  Edit ORTHOPHOTO_OPTIONS in
                  <br />
                  OrthoPhotoControl.tsx
                </p>
              </div>
            ) : (
              ORTHOPHOTO_OPTIONS.map((option) => {
                const isActive = hasOrthoPhoto(option.id);

                return (
                  <div
                    key={option.id}
                    className={[
                      "flex items-center gap-2 px-3 py-2 w-full transition-colors",
                      "border-b border-slate-50 dark:border-slate-800/50 last:border-0",
                      isActive
                        ? "bg-blue-50/60 dark:bg-blue-950/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40",
                    ].join(" ")}
                  >
                    {/* Toggle button */}
                    <button
                      type="button"
                      onClick={() =>
                        isActive
                          ? removeOrthoPhoto(option.id)
                          : addOrthoPhoto(option)
                      }
                      className={[
                        "shrink-0 transition-colors",
                        isActive
                          ? "text-blue-500 hover:text-blue-600"
                          : "text-slate-300 dark:text-slate-600 hover:text-slate-500",
                      ].join(" ")}
                      title={isActive ? "Hide overlay" : "Show overlay"}
                    >
                      {isActive ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Label */}
                    <span
                      className={[
                        "text-xs font-medium flex-1 min-w-0 truncate",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400",
                      ].join(" ")}
                      title={option.name}
                    >
                      {option.name}
                    </span>

                    {/* Remove button (only when active) */}
                    {isActive && (
                      <button
                        onClick={() => removeOrthoPhoto(option.id)}
                        className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                        title="Remove overlay"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
