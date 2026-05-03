"use client";

import "cesium/Build/Cesium/Widgets/widgets.css";

import { Viewer } from "cesium";
import React, { useEffect, useRef } from "react";

import { useCesium } from "./CesiumProvider";

interface CesiumViewerProps {
  className?: string;
  onReady?: (viewer: Viewer) => void;
  options?: Viewer.ConstructorOptions;
}

/**
 * Native Cesium Viewer component wrapped for React.
 * Uses CesiumManager for imperative control.
 */
const CesiumViewer: React.FC<CesiumViewerProps> = ({
  className = "w-full h-full",
  onReady,
  options
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { manager, isReady } = useCesium();
  const initialized = useRef(false);

  useEffect(() => {
    // Ensure this runs only in the browser
    if (typeof window !== "undefined") {
      window.CESIUM_BASE_URL = "/cesium";
    }
  }, []);

  useEffect(() => {
    if (isReady && manager && containerRef.current && !initialized.current) {
      const viewer = manager.initialize(containerRef.current, options);
      initialized.current = true;

      if (onReady) {
        onReady(viewer);
      }
    }

    return () => {
      // Cleanup if the component is unmounted and we want to destroy the viewer
      // For some apps, you might want to keep the viewer alive in the manager.
      // If so, comment out the destroy call.
      // manager?.destroy();
    };
  }, [isReady, manager, onReady, options]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'absolute' }}
    />
  );
};

export default CesiumViewer;
