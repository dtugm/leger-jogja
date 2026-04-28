# Cesium Wrapper Development & Maintenance Guide

This document outlines the architecture, development patterns, and maintenance procedures for the custom CesiumJS wrapper implemented in this Next.js project.

## 🏗 Architecture Overview

The wrapper follows a **Manager-Provider-Component** pattern. This separates the imperative, heavy-duty GIS logic of CesiumJS from the declarative React UI layer.

### Core Files
- `src/frontend/lib/cesium/CesiumManager.ts`: The "Brain". A pure TypeScript class that controls the `Cesium.Viewer` instance.
- `src/frontend/components/cesium/CesiumProvider.tsx`: The "Bridge". A React Context provider that manages the lifecycle of the `CesiumManager`.
- `src/frontend/components/cesium/CesiumViewer.tsx`: The "Container". The actual React component that renders the map.
- `src/frontend/components/cesium/CesiumViewerDynamic.tsx`: The "Loader". Handles SSR-safe lazy loading.

---

## 🛠 Developing the Wrapper

### 1. Adding New Features to the Manager
When adding new Cesium functionality (e.g., drawing shapes, adding data sources), always implement it first as a method in `CesiumManager.ts`.

**Example: Adding a Shape**
```typescript
// src/frontend/lib/cesium/CesiumManager.ts
public addPoint(position: Cartesian3) {
  return this.viewer?.entities.add({
    position: position,
    point: { pixelSize: 10, color: Color.RED }
  });
}
```

### 2. Exposing Features to React
After adding a method to the Manager, expose it through the `useCesium` hook in `CesiumProvider.tsx` if it needs to be called from UI components.

```typescript
// src/frontend/components/cesium/CesiumProvider.tsx
export const useCesium = () => {
  const { manager } = useContext(CesiumContext);
  
  const addPoint = (pos: any) => manager?.addPoint(pos);
  
  return { manager, addPoint, ... };
}
```

---

## ⚡️ Maintenance & Best Practices

### Avoiding Re-render Issues
- **Do not** store the entire Cesium `Viewer` or large Cesium objects (like `Entity` or `Tileset`) in standard React `useState`. This will cause massive performance drops.
- **Do** keep the Manager instance in a `useRef` (as done in `CesiumProvider`).
- **Do** use the `isReady` state to wait for initialization before calling manager methods.

### Memory Leak Prevention
- When adding event listeners in the Manager, always clean them up in the `destroy()` method.
- The `CesiumViewer` component calls `manager.destroy()` on unmount. Ensure this remains intact if you change how the component is used.

### Asset Management
Cesium requires static assets (workers, styles, images) to be served from the `public` folder.
- Ensure the `copy-cesium` script in `package.json` is run after installing new versions of the `cesium` package.
- `window.CESIUM_BASE_URL` is set to `/cesium` in `CesiumViewer.tsx`. Do not change this unless you move the assets.

---

## 🚀 Setup & Environment

### Cesium Ion Token
The wrapper looks for `NEXT_PUBLIC_CESIUM_ION_TOKEN` in your environment variables.
```env
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token_here
```

### Deployment
Since Cesium is heavy, always use the `CesiumViewerDynamic` component for pages. This ensures:
1. The bundle is code-split (smaller initial load).
2. It only runs on the client (Next.js SSR safety).

---

## 🧪 Testing New Changes
1. Use the `/cesium-demo` page to test new Manager methods.
2. Check the browser console for "Developer Error" messages from Cesium; these usually indicate incorrect API usage rather than React bugs.
3. Verify that navigating away from a map page and back doesn't double-initialize the viewer.
