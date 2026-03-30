import type { Translations } from "../types";

export const id: Translations = {
  navbar: {
    title: "Leger Yogyakarta",
    subtitle: "Penampil Geospasial 3D",
  },
  common: {
    loading: "Memuat...",
    error: "Terjadi kesalahan",
  },
  mapSettings: {
    title: "Pengaturan Peta",
    baseLayer: "Layer Dasar",
    cesiumDefault: "Cesium Default",
    openStreetMap: "OpenStreetMap",
    show3DBuildings: "Tampilkan Bangunan 3D",
  },
  leftSidebar: {
    title: "Leger Yogyakarta",
    subtitle: "Survei Batas Tanah",
    aboutTitle: "Tentang",
    aboutDesc:
      "Leger adalah program survei batas tanah sistematis di Daerah Istimewa Yogyakarta (DIY). Penampil 3D ini menyajikan data geospasial berupa citra ortofoto, jaringan jalan, dan model bangunan 3D untuk mendukung administrasi pertanahan dan perencanaan tata ruang.",
    legendTitle: "Legenda",
    legendOrtho: "Layer Ortofoto",
    legendRoads: "Jaringan Jalan",
    legendBuildings: "Bangunan 3D",
  },
  rightSidebar: {
    layersTitle: "Layer",
    orthoLabel: "Ortofoto",
    orthoDesc: "Citra udara resolusi tinggi",
    roadsLabel: "Jalan",
    roadsDesc: "Jaringan jalan OpenStreetMap",
    buildingsLabel: "Bangunan 3D",
    buildingsDesc: "Model bangunan berbasis OSM",
    settingsTitle: "Pengaturan",
    darkMode: "Mode Gelap",
    lightMode: "Mode Terang",
    language: "Bahasa",
  },
};
