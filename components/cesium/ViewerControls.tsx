"use client";

import { useState } from "react";

import { useTranslation } from "@/lib/i18n";

import { LayersIcon, XIcon } from "../icons";

interface ViewerControlsProps {
  baseLayer: "cesium" | "osm";
  onBaseLayerChange: (layer: "cesium" | "osm") => void;
  showBuildings: boolean;
  onToggleBuildings: (show: boolean) => void;
}

export default function ViewerControls({
  baseLayer,
  onBaseLayerChange,
  showBuildings,
  onToggleBuildings,
}: ViewerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  if (!isOpen) {
    return (
      <button
        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:bg-slate-100/90 dark:hover:bg-slate-800/90 transition-colors text-slate-700 dark:text-slate-300"
        onClick={() => setIsOpen(true)}
        aria-label={t.mapSettings.title}
      >
        <LayersIcon className="w-5 h-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10 w-64 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <LayersIcon className="w-4 h-4" aria-hidden="true" />
          <span className="font-medium text-sm">{t.mapSettings.title}</span>
        </div>
        <button
          className="p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label={t.mapSettings.title}
        >
          <XIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Base Layer Section */}
      <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.mapSettings.baseLayer}</p>
        <div className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="baseLayer"
              value="cesium"
              checked={baseLayer === "cesium"}
              onChange={() => onBaseLayerChange("cesium")}
              className="w-3.5 h-3.5 text-blue-500 bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            />
            <span className="text-sm">{t.mapSettings.cesiumDefault}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="baseLayer"
              value="osm"
              checked={baseLayer === "osm"}
              onChange={() => onBaseLayerChange("osm")}
              className="w-3.5 h-3.5 text-blue-500 bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            />
            <span className="text-sm">{t.mapSettings.openStreetMap}</span>
          </label>
        </div>
      </div>

      {/* Buildings Section */}
      <div className="px-3 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBuildings}
            onChange={(e) => onToggleBuildings(e.target.checked)}
            className="w-3.5 h-3.5 text-blue-500 bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
          <span className="text-sm">{t.mapSettings.show3DBuildings}</span>
        </label>
      </div>
    </div>
  );
}
