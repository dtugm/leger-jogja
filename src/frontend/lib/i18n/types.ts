// Supported locales
export type Locale = "en" | "id";

// Translation structure - single source of truth
// TypeScript will enforce that all translation files implement this interface
export interface Translations {
  navbar: {
    title: string;
    subtitle: string;
  };
  common: {
    loading: string;
    error: string;
  };
  mapSettings: {
    title: string;
    baseLayer: string;
    cesiumDefault: string;
    openStreetMap: string;
    show3DBuildings: string;
  };
  leftSidebar: {
    title: string;
    subtitle: string;
    aboutTitle: string;
    aboutDesc: string;
    legendTitle: string;
    legendOrtho: string;
    legendRoads: string;
    legendBuildings: string;
  };
  rightSidebar: {
    layersTitle: string;
    orthoLabel: string;
    orthoDesc: string;
    roadsLabel: string;
    roadsDesc: string;
    buildingsLabel: string;
    buildingsDesc: string;
    settingsTitle: string;
    darkMode: string;
    lightMode: string;
    language: string;
  };
}

// Context value type
export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
}
