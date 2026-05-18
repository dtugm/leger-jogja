"use client";

import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import AssetTable, { type Asset } from "@/components/catalog/asset-table";
import SearchInput from "@/components/search";
import StatCards from "@/components/stat-cards";

// ─── Dynamic Import ───────────────────────────────────────────────────────────
// MapLibre uses browser-only APIs (WebGL, window, etc.), so it must be
// loaded client-side only. `ssr: false` prevents server-render errors.
const CatalogMap = dynamic(
  () => import("./catalog-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-xl border border-border bg-muted animate-pulse mb-6" />
    ),
  }
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function CatalogClient({ assets }: { assets: Asset[] }) {
  const [query, setQuery] = useState("");

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.id.toLowerCase().includes(query.toLowerCase()) ||
    a.location.toLowerCase().includes(query.toLowerCase())
  );

  const good = filtered.filter((a) => a.condition === "Good").length;
  const fair = filtered.filter((a) => a.condition === "Fair").length;
  const poor = filtered.filter((a) => a.condition === "Poor").length;

  return (
    <>
      {/* ── Asset Map ── always shows all assets regardless of search filter */}


      {/* ── Stat Cards ── */}
      <StatCards stats={[
        { value: filtered.length, label: "Total Assets", color: "green" },
        { value: good, label: "Good", color: "blue" },
        { value: fair, label: "Fair", color: "yellow" },
        { value: poor, label: "Poor", color: "red" },
      ]} />

      <div className="my-6">
        <CatalogMap assets={assets} height="420px" />
      </div>

      {/* ── Toolbar ── */}
      <div className="mb-5 flex flex-col sm:flex-row items-strech sm:items-center gap-2 sm:gap-3">
        <SearchInput
          placeholder="Search assets..."
          value={query}
          onChange={setQuery}
          className="flex-1"
        />
        <Link
          href="/catalog/upload"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Add Files
        </Link>
      </div>

      {/* ── Asset Table ── */}
      <AssetTable
        assets={filtered}
        label={`Infrastructure Assets (${filtered.length} items)`}
      />
    </>
  );
}