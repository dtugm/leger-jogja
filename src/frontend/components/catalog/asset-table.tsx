"use client";

import { Calendar, MapPin, Ruler } from "lucide-react";

import Table, { ColumnDef } from "@/components/table";

export type Condition = "Good" | "Fair" | "Poor";
export type AssetType = "Road" | "Bridge";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  location: string;
  length: string;
  condition: Condition;
  lastInspection: string;
}

const conditionDot: Record<Condition, string> = {
  Good: "bg-[var(--color-success)]",
  Fair: "bg-[var(--color-warning)]",
  Poor: "bg-[var(--color-danger)]",
};

function buildColumns(assets: Asset[]): ColumnDef<Asset>[] {
  const locations = [...new Set(assets.map((a) => a.location))].sort();

  return [
    {
      key: "id",
      label: "ID",
      sortIcon: "both",
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortIcon: "both",
      render: (row) => (
        <span className="font-medium text-foreground">{row.name}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      filterOptions: ["Road", "Bridge"],
      render: (row) => (
        <span className="inline-block rounded border border-border px-2 py-0.5 text-xs text-foreground">
          {row.type}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      filterOptions: locations,
      render: (row) => (
        <span className="flex items-center gap-1.5 text-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {row.location}
        </span>
      ),
    },
    {
      key: "length",
      label: "Length",
      sortIcon: "both",
      render: (row) => (
        <span className="flex items-center gap-1.5 text-foreground">
          <Ruler className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {row.length}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Condition",
      filterOptions: ["Good", "Fair", "Poor"],
      render: (row) => (
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${conditionDot[row.condition]}`} />
          <span className="text-foreground">{row.condition}</span>
        </span>
      ),
    },
    {
      key: "lastInspection",
      label: "Last Inspection",
      sortIcon: "both",
      render: (row) => (
        <span className="flex items-center gap-1.5 text-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {row.lastInspection}
        </span>
      ),
    },
  ];
}

interface AssetTableProps {
  assets: Asset[];
  label?: string;
  onRowClick?: (asset: Asset) => void;
}

export default function AssetTable({ assets, label, onRowClick }: AssetTableProps) {
  const columns = buildColumns(assets);

  return (
    <Table
      columns={columns}
      data={assets}
      label={label}
      onRowClick={onRowClick}
      keyExtractor={(row) => row.id}
    />
  );
}