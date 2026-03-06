# Cesium + Next.js + TailwindCSS Starter Kit

A modern starter template for building 3D geospatial applications with Cesium, Next.js, and TailwindCSS.

## Features

- **3D Globe Visualization** - Interactive Cesium globe with Cesium World Terrain
- **Base Layer Switcher** - Toggle between Cesium Default imagery and OpenStreetMap
- **OSM 3D Buildings** - Optional OpenStreetMap 3D buildings layer
- **Dark/Light Theme** - System-aware theme switching with next-themes
- **Internationalization** - Built-in i18n support (English and Indonesian)
- **Modern Stack** - Next.js 16, React 19, TailwindCSS 4
- **TypeScript** - Full type safety throughout the codebase
- **Responsive Design** - Mobile-friendly navbar and layout

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- [Cesium Ion](https://cesium.com/ion/) account (free tier available)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/cesium-nextjs-starter-kit.git
   cd cesium-nextjs-starter-kit
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local` and add your Cesium Ion token:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```
   NEXT_PUBLIC_CESIUM_ION_TOKEN=your_cesium_ion_token_here
   ```

   Get your token from [Cesium Ion](https://cesium.com/ion/tokens).

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
cesium-nextjs-starter-kit/
├── app/
│   ├── globals.css          # Global styles and TailwindCSS
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home page with Cesium viewer
├── components/
│   ├── cesium/
│   │   ├── CesiumViewerDynamic.tsx  # Dynamic import wrapper
│   │   ├── Viewer.tsx               # Cesium viewer component
│   │   └── ViewerControls.tsx       # Map settings control panel
│   ├── icons/
│   │   └── index.tsx        # SVG icon components
│   └── navbar/
│       ├── index.tsx        # Navbar container
│       ├── NavbarActions.tsx # Theme/language buttons
│       └── NavbarLogo.tsx   # Logo component
├── lib/
│   └── i18n/
│       ├── context.tsx      # Language context provider
│       ├── index.ts         # i18n exports
│       ├── types.ts         # TypeScript types
│       ├── useTranslation.ts # Translation hook
│       └── translations/
│           ├── en.ts        # English translations
│           ├── id.ts        # Indonesian translations
│           └── index.ts     # Translation exports
├── public/
│   └── cesium/              # Cesium assets (auto-generated)
├── .env.example             # Environment variables template
├── next.config.ts           # Next.js configuration
├── package.json
├── postcss.config.mjs       # PostCSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Customization

### Map Controls

The viewer includes a control panel (top-right corner) with:

- **Base Layer Selection** - Switch between Cesium Default imagery and OpenStreetMap tiles
- **3D Buildings Toggle** - Enable/disable OSM 3D Buildings overlay

The buildings are rendered on top of Cesium World Terrain for accurate elevation.

### Adding Cesium Features

Edit `components/cesium/Viewer.tsx` to add Cesium features:

```tsx
import { Entity, Viewer } from "resium";
import { Cartesian3 } from "cesium";

// Add entities, 3D tiles, terrain, imagery layers, etc.
<Viewer>
  <Entity
    position={Cartesian3.fromDegrees(110.3695, -7.7956, 100)}
    point={{ pixelSize: 10 }}
  />
</Viewer>;
```

### Adding Translations

1. Add new keys to `lib/i18n/types.ts`
2. Add translations to `lib/i18n/translations/en.ts` and `id.ts`
3. Use with the `useTranslation` hook:

```tsx
import { useTranslation } from "@/lib/i18n/useTranslation";

function MyComponent() {
  const { t } = useTranslation();
  return <p>{t.common.loading}</p>;
}
```

### Changing the Initial Camera Position

Edit `INITIAL_POSITION` in `components/cesium/Viewer.tsx`:

```tsx
const INITIAL_POSITION = {
  longitude: 110.377766, // degress
  latitude: -7.779264, // degress
  height: 1000, // meters
};
```

## Scripts

| Script             | Description                             |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | Start development server with Turbopack |
| `pnpm build`       | Build for production                    |
| `pnpm start`       | Start production server                 |
| `pnpm lint`        | Run ESLint                              |
| `pnpm typecheck`   | Run Typecheck                           |
| `pnpm copy-cesium` | Copy Cesium assets to public folder     |

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS
- [Cesium](https://cesium.com/) - 3D geospatial visualization
- [Resium](https://resium.reearth.io/) - React components for Cesium
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

GNU GPL
