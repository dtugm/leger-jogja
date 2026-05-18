"use client";

import { useCallback, useEffect, useState } from "react";

import type { Tile3D } from "@/types/3dtiles";

/* ------------------------------------------------------------------ */
/*  Mock data — replace with real API call when backend is ready        */
/* ------------------------------------------------------------------ */

const MOCK_TILES: Tile3D[] = [
  {
    id: "tile-001",
    name: "Keraton Yogyakarta",
    url: "https://example.com/tiles/keraton/tileset.json",
    assetType: "Bangunan",
    region: "Kraton, Yogyakarta",
    description: "Model 3D kompleks Keraton Ngayogyakarta Hadiningrat",
    isPublic: true,
    createdAt: "2024-03-15T08:00:00Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.3636, -7.8059],
          [110.3660, -7.8059],
          [110.3660, -7.8078],
          [110.3636, -7.8078],
          [110.3636, -7.8059],
        ],
      ],
    },
  },
  {
    id: "tile-002",
    name: "Candi Prambanan",
    url: "https://example.com/tiles/prambanan/tileset.json",
    assetType: "Bangunan",
    region: "Prambanan, Sleman",
    description: "Model 3D kompleks Candi Prambanan abad ke-9",
    isPublic: true,
    createdAt: "2024-03-20T09:30:00Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.4914, -7.7520],
          [110.4940, -7.7520],
          [110.4940, -7.7545],
          [110.4914, -7.7545],
          [110.4914, -7.7520],
        ],
      ],
    },
  },
  {
    id: "tile-003",
    name: "Malioboro Street Corridor",
    url: "https://example.com/tiles/malioboro/tileset.json",
    assetType: "Jalan",
    region: "Gedongtengen, Yogyakarta",
    description: "Koridor jalan Malioboro beserta bangunan di kiri-kanan",
    isPublic: true,
    createdAt: "2024-04-01T10:00:00Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.3631, -7.7929],
          [110.3660, -7.7929],
          [110.3660, -7.8000],
          [110.3631, -7.8000],
          [110.3631, -7.7929],
        ],
      ],
    },
  },
  {
    id: "tile-004",
    name: "Taman Sari Water Castle",
    url: "https://example.com/tiles/tamansari/tileset.json",
    assetType: "Fasilitas",
    region: "Patehan, Yogyakarta",
    description: "Rekonstruksi 3D Taman Sari sebagai situs warisan budaya",
    isPublic: false,
    createdAt: "2024-04-10T11:00:00Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.3594, -7.8100],
          [110.3618, -7.8100],
          [110.3618, -7.8120],
          [110.3594, -7.8120],
          [110.3594, -7.8100],
        ],
      ],
    },
  },
  {
    id: "tile-005",
    name: "Lahan Pertanian Bantul",
    url: "https://example.com/tiles/bantul-lahan/tileset.json",
    assetType: "Lahan",
    region: "Bantul",
    description: "Pemetaan lahan pertanian produktif Kabupaten Bantul 2024",
    isPublic: true,
    createdAt: "2024-05-01T07:00:00Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.3200, -7.8900],
          [110.3700, -7.8900],
          [110.3700, -7.9400],
          [110.3200, -7.9400],
          [110.3200, -7.8900],
        ],
      ],
    },
  },
  {
    id: "tile-006",
    name: "Bandara YIA Kulon Progo",
    url: "https://example.com/tiles/yia/tileset.json",
    assetType: "Fasilitas",
    region: "Temon, Kulon Progo",
    description: "Model 3D terminal dan landasan Yogyakarta International Airport",
    isPublic: false,
    createdAt: "2024-05-15T08:30:00Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.0550, -7.9030],
          [110.0750, -7.9030],
          [110.0750, -7.9200],
          [110.0550, -7.9200],
          [110.0550, -7.9030],
        ],
      ],
    },
  },
  {
    id: "tile-007",
    name: "Kawasan Industri Berbah",
    url: "https://example.com/tiles/industri-berbah/tileset.json",
    assetType: "Lainnya",
    region: "Berbah, Sleman",
    description: "Kawasan industri dan pergudangan Berbah Sleman",
    isPublic: true,
    createdAt: "2024-06-01T09:00:00Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [110.4600, -7.8100],
          [110.4800, -7.8100],
          [110.4800, -7.8300],
          [110.4600, -7.8300],
          [110.4600, -7.8100],
        ],
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Hook                                                                 */
/* ------------------------------------------------------------------ */

export function use3DTiles() {
  const [tiles, setTiles] = useState<Tile3D[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: replace with real API call, e.g.:
      // const response = await TilesApi.getAll();
      // if (isApiSuccess(response)) setTiles(response.data);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      setTiles(MOCK_TILES);
    } catch {
      setError("Gagal memuat data 3D tiles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiles();
  }, [fetchTiles]);

  return {
    tiles,
    isLoading,
    error,
    refetch: fetchTiles,
  };
}
