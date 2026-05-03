"use client";

import { createContext, useContext,useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentStyle: React.CSSProperties;
  setContentStyle: (s: React.CSSProperties) => void;
}

const Ctx = createContext<DropdownCtx | null>(null);
const useCtx = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Must be used inside <DropdownMenu>");
  return ctx;
};

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [contentStyle, setContentStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Ctx.Provider value={{ open, setOpen, triggerRef, contentStyle, setContentStyle }}>
      <div className="relative inline-block">{children}</div>
    </Ctx.Provider>
  );
}

interface TriggerProps {
  children: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  asChild?: boolean;
}

export function DropdownMenuTrigger({ children, asChild }: TriggerProps) {
  const { open, setOpen, triggerRef, setContentStyle } = useCtx();

  const handleClick = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;

      setContentStyle({
        position: "fixed",
        left: rect.left,
        minWidth: rect.width,
        zIndex: 9999,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    }
    setOpen(!open);
  };

  if (asChild) {
    return (
      <button
        ref={triggerRef}
        onClick={handleClick}
        className={children.props.className}
      >
        {children.props.children as React.ReactNode}
      </button>
    );
  }

  return (
    <button ref={triggerRef} onClick={handleClick}>
      {children}
    </button>
  );
}

interface ContentProps {
  children: React.ReactNode;
  align?: "start" | "end";
}

export function DropdownMenuContent({ children }: ContentProps) {
  const { open, setOpen, triggerRef, contentStyle } = useCtx();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click yeah
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      style={contentStyle}
      className="
        rounded-lg border border-border bg-background
        shadow-xl shadow-black/10 py-1
        animate-in fade-in-0 zoom-in-95 duration-100
        overflow-hidden
      "
    >
      {children}
    </div>,
    document.body
  );
}

interface ItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenuItem({ children, onClick, className = "" }: ItemProps) {
  const { setOpen } = useCtx();

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={`
        w-full flex items-center px-3 py-2 text-sm text-left
        text-foreground hover:bg-muted transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="-mx-0 my-1 h-px bg-border" />;
}