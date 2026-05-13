"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <PageBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous">
        <ChevronLeft className="h-4 w-4" />
      </PageBtn>

      {pages.map((p: number | "...", i: number) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
        ) : (
          <PageBtn key={p} onClick={() => onPageChange(p as number)} active={p === page}>
            {p}
          </PageBtn>
        ),
      )}

      <PageBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next">
        <ChevronRight className="h-4 w-4" />
      </PageBtn>
    </div>
  );
}

function PageBtn({
  children, onClick, disabled, active, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-8 h-8 px-2 rounded-lg text-sm transition-colors
      ${active
        ? "bg-primary-50 text-primary-700 dark:bg-primary-700 dark:text-primary-100 font-bold"
        : "font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}