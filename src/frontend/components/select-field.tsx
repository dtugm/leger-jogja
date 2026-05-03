"use client";

<<<<<<< HEAD
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
=======
import { ChevronDown } from "lucide-react";
>>>>>>> 0af0e46bb0863ad3864c1db7b9077dedffe34d19

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
<<<<<<< HEAD
  disabled?: boolean;
  required?: boolean;
=======
>>>>>>> 0af0e46bb0863ad3864c1db7b9077dedffe34d19
  className?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
<<<<<<< HEAD
  disabled = false,
  required = false,
  className = "",
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleToggle = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setOpenUpward(window.innerHeight - rect.bottom < 220);
    }
    setOpen((prev) => !prev);
  };

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          ref={triggerRef}
          onClick={handleToggle}
          className={`
            w-full flex items-center justify-between
            rounded-lg border bg-background px-3 py-2.5 text-sm text-left
            transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20
            disabled:cursor-not-allowed disabled:opacity-50
            ${open
              ? "border-primary-400 ring-2 ring-primary-500/20"
              : "border-border hover:border-muted-foreground/50"
            }
            ${!value ? "text-muted-foreground" : "text-foreground"}
          `}
        >
          <span>{selectedLabel ?? placeholder}</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div
            ref={dropdownRef}
            className={`
              absolute left-0 right-0 z-50
              rounded-lg border border-border bg-background
              shadow-xl shadow-black/10 overflow-hidden
              animate-in fade-in-0 zoom-in-95 duration-100
              ${openUpward ? "bottom-full mb-1" : "top-full mt-1"}
            `}
          >
            <div className="py-1 max-h-52 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full flex items-center justify-between
                      px-3 py-2 text-sm text-left transition-colors
                      ${isSelected
                        ? "bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

=======
  className = "",
}: SelectFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 pr-9 text-sm text-foreground transition-colors
            focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20
            ${!value ? "text-muted-foreground" : ""}
          `}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
>>>>>>> 0af0e46bb0863ad3864c1db7b9077dedffe34d19
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}