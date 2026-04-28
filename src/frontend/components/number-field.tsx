"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface NumberFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function NumberField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  placeholder,
  error,
  className = "",
}: NumberFieldProps) {
  const handleStep = (direction: "up" | "down") => {
    const current = parseFloat(value) || 0;
    const next = direction === "up" ? current + step : current - step;
    if (min !== undefined && next < min) return;
    if (max !== undefined && next > max) return;
    
    const decimals = (step.toString().split(".")[1] ?? "").length;
    onChange(next.toFixed(decimals));
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div
        className="flex items-center rounded-lg border border-border bg-background overflow-hidden transition-colors focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^\d*\.?\d*$/.test(val)) onChange(val);
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
        />
        {unit && (
          <span className="pr-1 text-xs text-muted-foreground select-none">{unit}</span>
        )}
        <div className="flex flex-col border-l border-border">
          <button
            type="button"
            onClick={() => handleStep("up")}
            className="px-1.5 py-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => handleStep("down")}
            className="px-1.5 py-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border-t border-border"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
