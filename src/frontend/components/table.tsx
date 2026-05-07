"use client";

import { ArrowDown, ArrowUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";

export type SortDirection = "asc" | "desc" | null;
export type SortIcon = "both" | "single";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortIcon?: SortIcon;
  filterOptions?: string[];
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  label?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export default function Table<T>({
  columns,
  data,
  label,
  onRowClick,
  keyExtractor,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string | null>>({});

  function handleSort(key: string, dir: SortDirection) {
    setSortKey(dir ? key : null);
    setSortDir(dir);
  }

  function handleFilter(key: string, value: string | null) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filtered = data.filter((row) =>
    Object.entries(filters).every(([key, val]) => {
      if (!val) return true;
      return String((row as Record<string, unknown>)[key]) === val;
    })
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const aVal = String((a as Record<string, unknown>)[sortKey] ?? "");
    const bVal = String((b as Record<string, unknown>)[sortKey] ?? "");
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {label && (
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-border">
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => {
                const isFiltered = !!filters[col.key];
                const isSorted = sortKey === col.key;

                return (
                  <th key={col.key} className={`px-3 py-2.5 sm:px-4 sm:py-3 text-left ${col.className ?? ""}`}>
                    {col.filterOptions ? (
                      // FILTER dropdown
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`flex items-center gap-1 text-xs font-medium transition-colors
                            ${isFiltered ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            {col.label}
                            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {col.filterOptions.map((opt) => (
                            <DropdownMenuItem
                              key={opt}
                              onClick={() => handleFilter(col.key, filters[col.key] === opt ? null : opt)}
                              className={filters[col.key] === opt ? "text-foreground font-medium" : ""}
                            >
                              {opt}
                            </DropdownMenuItem>
                          ))}
                          {isFiltered && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleFilter(col.key, null)}
                                className="text-muted-foreground"
                              >
                                Clear Filter
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : col.sortIcon ? (
                      // SORT dropdown
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`flex items-center gap-1 text-xs font-medium transition-colors
                            ${isSorted ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            {col.label}
                            {isSorted
                              ? sortDir === "asc"
                                ? <ArrowUp className="h-3.5 w-3.5" />
                                : <ArrowDown className="h-3.5 w-3.5" />
                              : <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleSort(col.key, "asc")}>
                            <ArrowUp className="h-3.5 w-3.5 mr-2" /> Sort Ascending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSort(col.key, "desc")}>
                            <ArrowDown className="h-3.5 w-3.5 mr-2" /> Sort Descending
                          </DropdownMenuItem>
                          {isSorted && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSort(col.key, null)}
                                className="text-muted-foreground"
                              >
                                Clear Sort
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">{col.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border last:border-0 transition-colors
                  ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-3 sm:px-4 sm:py-3.5 ${col.className ?? ""}`}>
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}