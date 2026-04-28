"use client";

import dynamic from "next/dynamic";

const CesiumViewerDynamic = dynamic(
  () => import("./CesiumViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p>Initializing Cesium Engine...</p>
        </div>
      </div>
    )
  }
);

export default CesiumViewerDynamic;
