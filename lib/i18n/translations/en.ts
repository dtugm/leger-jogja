import type { Translations } from "../types";

export const en: Translations = {
  navbar: {
    title: "Leger Yogyakarta",
    subtitle: "3D Geospatial Viewer",
  },
  common: {
    loading: "Loading...",
    error: "An error occurred",
  },
  mapSettings: {
    title: "Map Settings",
    baseLayer: "Base Layer",
    cesiumDefault: "Cesium Default",
    openStreetMap: "OpenStreetMap",
    show3DBuildings: "Show 3D Buildings",
  },
  leftSidebar: {
    title: "Leger Yogyakarta",
    subtitle: "Land Boundary Survey",
    aboutTitle: "About",
    aboutDesc:
      "Leger is a systematic land boundary survey program in the Special Region of Yogyakarta (DIY). This 3D viewer presents geospatial data including orthophoto imagery, road networks, and 3D building models to support land administration and spatial planning.",
    legendTitle: "Legend",
    legendOrtho: "Orthophoto Layer",
    legendRoads: "Road Network",
    legendBuildings: "3D Buildings",
  },
  rightSidebar: {
    layersTitle: "Layers",
    orthoLabel: "Orthophoto",
    orthoDesc: "High-resolution aerial imagery",
    roadsLabel: "Roads",
    roadsDesc: "OpenStreetMap road network",
    buildingsLabel: "3D Buildings",
    buildingsDesc: "OSM-based building models",
    settingsTitle: "Settings",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
  },
};
