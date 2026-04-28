"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect,useRef, useState } from "react";

interface MultiSelectFieldProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function MultiSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
  className = "",
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const remove = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== opt));
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      
      <div className="relative">
        <div
          className={`
            min-h-10.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 cursor-pointer
            transition-colors
            ${open ? "border-primary-400 ring-2 ring-primary-500/20" : ""}
          `}
          onClick={() => setOpen(!open)}
        >
          {value.length === 0 && (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
            >
              {v}
              <button
                type="button"
                onClick={(e) => remove(v, e)}
                className="hover:text-primary-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <ChevronDown
            className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>

        {open && (
          <div className="absolute z-10 top-full mt-1 w-full rounded-lg border border-border bg-background shadow-lg py-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between transition-colors
                  ${value.includes(opt) ? "text-primary-600 font-medium" : "text-foreground"}
                `}
              >
                {opt}
                {value.includes(opt) && (
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}