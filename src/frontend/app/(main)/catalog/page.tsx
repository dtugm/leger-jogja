import type { Asset } from "@/components/catalog/asset-table";
import PageHeader from "@/components/page-header";

import CatalogClient from "./_components/catalog-client";

//ganti API call yakkk
const ASSETS: Asset[] = [
  { id: "RD-001", name: "Jalan Tol Jakarta-Cikampek KM 23", type: "Road",   location: "West Java",       length: "72.5 km",  condition: "Good", lastInspection: "2026-01-15", coordinates: [107.154, -6.386] },
  { id: "BR-001", name: "Jembatan Suramadu",                type: "Bridge", location: "East Java",       length: "5.4 km",   condition: "Good", lastInspection: "2026-01-20", coordinates: [112.771, -7.183] },
  { id: "RD-002", name: "Jalan Lingkar Luar Jakarta",       type: "Road",   location: "Jakarta",         length: "65.1 km",  condition: "Fair", lastInspection: "2026-01-10", coordinates: [106.827, -6.302] },
  { id: "BR-002", name: "Jembatan Ampera",                  type: "Bridge", location: "South Sumatra",   length: "1.2 km",   condition: "Good", lastInspection: "2026-01-22", coordinates: [104.763, -2.991] },
  { id: "RD-003", name: "Jalan Trans Papua",                type: "Road",   location: "Papua",           length: "4,330 km", condition: "Poor", lastInspection: "2025-12-28", coordinates: [140.718, -4.118] },
  { id: "BR-003", name: "Jembatan Mahakam",                 type: "Bridge", location: "East Kalimantan", length: "0.8 km",   condition: "Fair", lastInspection: "2026-01-18", coordinates: [117.149, -0.497] },
  { id: "RD-004", name: "Jalan Tol Cipularang",             type: "Road",   location: "West Java",       length: "72.7 km",  condition: "Good", lastInspection: "2026-01-25", coordinates: [107.407, -6.731] },
  { id: "BR-004", name: "Jembatan Barelang",                type: "Bridge", location: "Riau Islands",    length: "2.0 km",   condition: "Good", lastInspection: "2026-01-12", coordinates: [104.051, 1.121]  },
  { id: "RD-005", name: "Jalan Pantura",                    type: "Road",   location: "North Java",      length: "1,000 km", condition: "Fair", lastInspection: "2026-01-08", coordinates: [110.421, -6.973] },
  { id: "BR-005", name: "Jembatan Kutai Kartanegara",       type: "Bridge", location: "East Kalimantan", length: "0.71 km",  condition: "Poor", lastInspection: "2025-12-30", coordinates: [117.130, -0.453] },
];

export default function CatalogPage() {
  return (
    <div className="mx-auto w-[90%] py-6 sm:py-8 xl:max-w-[80%]">
      <PageHeader
        title="Asset Catalog"
        subtitle="Comprehensive database of road and bridge infrastructure assets"
      />
      <CatalogClient assets={ASSETS} />
    </div>
  );
}