"use client";

import {
  Box,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Factory,
  Layers,
  Lock,
  Map,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Plus,
  Route,
  Search,
  Sprout,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { BasemapControl } from "@/components/cesium/BasemapControl";
import { CesiumLayerBridge } from "@/components/cesium/CesiumLayerBridge";
import { CesiumProvider, useCesium } from "@/components/cesium/CesiumProvider";
import CesiumViewerDynamic from "@/components/cesium/CesiumViewerDynamic";
import { OrthoPhotoControl } from "@/components/cesium/OrthoPhotoControl";
import { TerrainControl } from "@/components/cesium/TerrainControl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { use3DTiles } from "@/hooks/use-3dtiles";
import { useMainViewerStore } from "@/store/mainViewer.store";
import type { Tile3D } from "@/types/3dtiles";

/* ------------------------------------------------------------------ */
/*  Map Thumbnail                                                        */
/* ------------------------------------------------------------------ */

function MapThumbnail({
  assetType,
  selected,
}: {
  assetType: string | null;
  selected: boolean;
}) {
  const Icon =
    assetType === "Bangunan"
      ? Building2
      : assetType === "Jalan"
        ? Route
        : assetType === "Lahan"
          ? Sprout
          : assetType === "Fasilitas"
            ? Factory
            : assetType === "Lainnya"
              ? Box
              : MapPin;

  return (
    <div
      className={[
        "w-12 h-12 shrink-0 rounded-lg flex items-center justify-center border-2 transition-colors duration-150",
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600",
      ].join(" ")}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Asset Card                                                           */
/* ------------------------------------------------------------------ */

function AssetCard({
  asset,
  selected,
  onSelect,
}: {
  asset: Tile3D;
  selected: boolean;
  onSelect: () => void;
}) {
  const { addLayer, removeLayer, hasLayer, requestFlyTo } =
    useMainViewerStore();
  const isLoaded = hasLayer(asset.id);

  /**
   * Derive a rough centroid from the geometry so the "Fly To" button works
   * even before the tileset is loaded.
   */
  const centroid = (() => {
    try {
      const ring = asset.geometry?.coordinates?.[0];
      if (!ring || ring.length === 0) return null;
      const lngs = ring.map((c) => c[0]);
      const lats = ring.map((c) => c[1]);
      return {
        longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
        latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
        height: 500,
      };
    } catch {
      return null;
    }
  })();

  const canFlyTo = isLoaded || !!centroid;

  const handleMapToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoaded) {
      removeLayer(asset.id);
    } else {
      addLayer({
        id: asset.id,
        name: asset.name,
        url: asset.url,
        sourceType: "tileset",
        visible: true,
      });
    }
  };

  const assetType = asset.assetType ?? null;
  const formattedDate = asset.createdAt
    ? new Date(asset.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={[
        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-400",
        selected
          ? "border-blue-400 bg-blue-50/60 dark:bg-blue-950/20 shadow-sm"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm",
      ].join(" ")}
    >
      <MapThumbnail assetType={assetType} selected={selected} />

      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate leading-snug">
            {asset.name}
          </p>
          {asset.isPublic === false && (
            <span title="Privat" className="shrink-0">
              <Lock className="w-3 h-3 text-slate-400" />
            </span>
          )}
        </div>

        {/* Region & date */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {[asset.region, formattedDate].filter(Boolean).join(" · ") || "—"}
        </p>

        <div className="flex items-center justify-between mt-2.5">
          {/* Asset type badge */}
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
            {assetType ?? "Unset"}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Fly To button */}
            <button
              type="button"
              disabled={!canFlyTo}
              onClick={(e) => {
                e.stopPropagation();
                requestFlyTo({
                  id: asset.id,
                  longitude: centroid?.longitude,
                  latitude: centroid?.latitude,
                  height: centroid?.height,
                });
              }}
              title={
                isLoaded
                  ? "Terbang ke tileset"
                  : centroid
                    ? "Terbang ke lokasi aset"
                    : "Muat layer terlebih dahulu"
              }
              className={[
                "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                canFlyTo
                  ? "text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  : "text-slate-300 dark:text-slate-700 cursor-not-allowed",
              ].join(" ")}
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>

            {/* Map toggle button */}
            <Button
              size="sm"
              className={[
                "h-7 px-2.5 gap-1 border-0 text-xs font-semibold shadow-none rounded-lg transition-colors",
                isLoaded
                  ? "bg-emerald-500 hover:bg-red-500 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white",
              ].join(" ")}
              onClick={handleMapToggle}
              title={
                isLoaded
                  ? "Klik untuk hapus dari viewer"
                  : "Klik untuk tampilkan di viewer"
              }
            >
              {isLoaded ? (
                <>
                  <Check className="w-3 h-3" />
                  Aktif
                </>
              ) : (
                <>
                  <Map className="w-3 h-3" />
                  Map
                  <Plus className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Active Layers Panel (floating overlay on the Cesium panel)         */
/* ------------------------------------------------------------------ */

function ActiveLayersPanel() {
  const { layers, removeLayer, toggleVisibility, clearLayers } =
    useMainViewerStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center">
      {/* ── Toggle tab (always visible, on the left edge of the panel) ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup panel layer" : "Buka panel layer"}
        title="Layer Aktif"
        className="flex flex-col items-center justify-center gap-1 w-6 h-16 rounded-l-lg bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-r-0 border-slate-200 dark:border-slate-700 shadow-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        {open ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
        <Layers className="w-3 h-3" />
        {layers.length > 0 && (
          <span className="text-[9px] font-bold leading-none text-blue-500">
            {layers.length}
          </span>
        )}
      </button>

      {/* ── Panel (slides in from the right) ─────────────────────────── */}
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "w-56 opacity-100" : "w-0 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-56 rounded-l-xl bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-r-0 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Layer Aktif
                <span className="ml-1 text-slate-400">({layers.length})</span>
              </span>
            </div>
            {layers.length > 0 && (
              <button
                onClick={clearLayers}
                className="text-[11px] text-slate-400 hover:text-red-500 transition-colors font-medium"
                title="Hapus semua layer"
              >
                Hapus semua
              </button>
            )}
          </div>

          {/* Layer list / empty state */}
          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-slate-400 dark:text-slate-600">
              <Layers className="w-5 h-5 opacity-40" />
              <p className="text-xs">Tidak ada layer aktif</p>
            </div>
          ) : (
            <div className="max-h-44 overflow-y-auto">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 group"
                >
                  {/* Visibility toggle */}
                  <button
                    onClick={() => toggleVisibility(layer.id)}
                    className={[
                      "shrink-0 transition-colors",
                      layer.visible
                        ? "text-blue-500 hover:text-blue-600"
                        : "text-slate-300 dark:text-slate-600 hover:text-slate-500",
                    ].join(" ")}
                    title={
                      layer.visible ? "Sembunyikan layer" : "Tampilkan layer"
                    }
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Layer name */}
                  <span
                    className={[
                      "flex-1 min-w-0 text-xs truncate",
                      layer.visible
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-600 line-through",
                    ].join(" ")}
                    title={layer.name}
                  >
                    {layer.name}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="shrink-0 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Hapus layer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CesiumResizeTrigger                                                  */
/* ------------------------------------------------------------------ */

/**
 * Placed INSIDE <CesiumProvider>.
 * Watches `expanded` and calls viewer.resize() after the layout settles,
 * giving Cesium the signal it needs to fill its new container.
 */
function CesiumResizeTrigger({ expanded }: { expanded: boolean }) {
  const { manager } = useCesium();

  useEffect(() => {
    if (!manager) return;
    const raf = requestAnimationFrame(() => {
      manager.getViewer()?.resize();
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(raf);
  }, [expanded, manager]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Cesium Panel (right side — viewer + overlays)                      */
/* ------------------------------------------------------------------ */

function CesiumPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const layers = useMainViewerStore((s) => s.layers);
  const isEmpty = layers.length === 0;

  /* Close on ESC */
  useEffect(() => {
    if (!isExpanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isExpanded]);

  return (
    <div
      className={[
        "overflow-hidden",
        isExpanded
          ? "fixed inset-0 z-[9999] rounded-none bg-slate-950"
          : "relative flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-800",
      ].join(" ")}
    >
      <CesiumProvider>
        <div className="absolute inset-0">
          <CesiumViewerDynamic className="w-full h-full" />
        </div>
        <CesiumLayerBridge />
        <CesiumResizeTrigger expanded={isExpanded} />
      </CesiumProvider>

      {/* ── Empty-state hint (covers viewer until first layer loads) ── */}
      {isEmpty && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-50/95 dark:bg-slate-900/95 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-inner">
            <Map className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Belum ada layer yang dimuat
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1.5 leading-relaxed">
              Tekan{" "}
              <span className="inline-flex items-center gap-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono">
                Map +
              </span>{" "}
              pada aset manapun untuk menampilkannya di sini
            </p>
          </div>
        </div>
      )}

      {/* ── Right-side collapsible panels ────────────────────────────── */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 items-end">
        <ActiveLayersPanel />
        <BasemapControl />
        <TerrainControl />
        <OrthoPhotoControl />
      </div>

      {/* ── Brand watermark — visible only in fullscreen ─────────────── */}
      {isExpanded && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 pointer-events-none select-none">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Map className="w-4 h-4 text-white/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white/90 leading-tight tracking-tight">
              Leger Jogja
            </span>
            <span className="text-[10px] text-white/50 leading-tight">
              Geo-AI Platform
            </span>
          </div>
        </div>
      )}

      {/* ── ESC hint — visible only while expanded ──────────────────── */}
      {isExpanded && (
        <div
          aria-live="polite"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-xs pointer-events-none select-none"
        >
          Tekan <kbd className="font-mono font-semibold">ESC</kbd> untuk keluar
        </div>
      )}

      {/* ── Expand / Compress toggle ─────────────────────────────────── */}
      <button
        aria-label={isExpanded ? "Keluar fullscreen" : "Masuk fullscreen"}
        onClick={() => setIsExpanded((v) => !v)}
        className="absolute bottom-3 right-3 z-20 w-7 h-7 rounded-md bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        {isExpanded ? (
          <Minimize2 className="w-3.5 h-3.5" />
        ) : (
          <Maximize2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                 */
/* ------------------------------------------------------------------ */

export default function CesiumViewerPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { tiles, isLoading, error, refetch } = use3DTiles();

  const filtered = tiles.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.region ?? "").toLowerCase().includes(q) ||
      (a.assetType ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-5 overflow-hidden">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          3D Viewer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Visualisasi data 3D tiles wilayah Daerah Istimewa Yogyakarta
        </p>
      </div>

      {/* ── Main card ───────────────────────────────────────────────── */}
      <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardContent className="flex-1 min-h-0 px-6 pb-5 pt-4">
          <div className="flex gap-5 h-full">
            {/* ── Left Panel — Asset list ──────────────────────────── */}
            <div className="w-80 shrink-0 flex flex-col gap-3 min-h-0">
              {/* Search */}
              <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari aset 3D..."
                  className="pl-9 h-9 text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:border-blue-400"
                />
              </div>

              {/* Count / refetch row */}
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {isLoading
                    ? "Memuat…"
                    : `${filtered.length} aset${filtered.length !== 1 ? "" : ""}`}
                </span>
                <button
                  type="button"
                  onClick={refetch}
                  disabled={isLoading}
                  className="text-xs font-medium text-blue-500 hover:text-blue-600 disabled:opacity-40 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {/* Scrollable asset list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
                {isLoading ? (
                  /* Skeleton */
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 animate-pulse"
                    />
                  ))
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {error}
                    </p>
                    <button
                      onClick={refetch}
                      className="text-xs underline text-blue-500"
                    >
                      Coba lagi
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
                    <Search className="w-8 h-8 opacity-40" />
                    <p className="text-sm">Aset tidak ditemukan</p>
                  </div>
                ) : (
                  filtered.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      selected={selectedId === asset.id}
                      onSelect={() => setSelectedId(asset.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ── Right Panel — Cesium 3D Viewer ───────────────────── */}
            <CesiumPanel />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
