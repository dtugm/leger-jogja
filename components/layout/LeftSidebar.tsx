"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";

import { useTranslation } from "@/lib/i18n";
import { useMapSettings } from "@/lib/map-settings";

// Layer dot for legend
function LegendDot({
  color,
  glow,
  active,
}: {
  color: string;
  glow: string;
  active: boolean;
}) {
  return (
    <span
      className={`
        inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300
        ${color}
        ${active ? "" : "opacity-20"}
      `}
      style={active ? { boxShadow: `0 0 7px 2px ${glow}` } : {}}
    />
  );
}

export default function LeftSidebar() {
  const { t } = useTranslation();
  const { settings } = useMapSettings();
  const { showOrtho, showRoads, showBuildings } = settings;

  return (
    <aside className="glass-sidebar glass-sidebar-accent-top relative w-72 flex-shrink-0 flex flex-col h-full border-r z-10 animate-fade-in">
      {/* ── Branding Header ─────────────────────────────── */}
      <div className="relative px-5 pt-5 pb-4 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 opacity-90" />
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
            <svg
              className="relative w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none tracking-tight">
              {t.leftSidebar.title}
            </h1>
            <p className="text-[11px] font-semibold mt-1 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              {t.leftSidebar.subtitle}
            </p>
          </div>
        </div>

        {/* Gradient accent bar */}
        <div className="h-px w-full rounded-full bg-gradient-to-r from-indigo-500/80 via-cyan-400/60 to-transparent" />

        {/* Ambient corner glow */}
        <div className="pointer-events-none absolute top-0 left-0 w-40 h-40 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* ── Scrollable Content ─────────────────────────── */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          {/* About */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <svg
                className="w-3.5 h-3.5 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                {t.leftSidebar.aboutTitle}
              </span>
            </div>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.leftSidebar.aboutDesc}
            </p>
          </div>

          <Separator.Root className="neon-divider mx-5 mb-4" />

          {/* Legend */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-3.5 h-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                {t.leftSidebar.legendTitle}
              </span>
            </div>

            <div className="space-y-2.5 pl-1">
              {/* Ortho */}
              <div className="flex items-center gap-3">
                <LegendDot
                  color="bg-amber-400"
                  glow="rgba(251,191,36,0.7)"
                  active={showOrtho}
                />
                <span
                  className={`text-[12px] transition-colors ${showOrtho ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500 line-through"}`}
                >
                  {t.leftSidebar.legendOrtho}
                </span>
              </div>
              {/* Roads */}
              <div className="flex items-center gap-3">
                <LegendDot
                  color="bg-rose-400"
                  glow="rgba(251,113,133,0.7)"
                  active={showRoads}
                />
                <span
                  className={`text-[12px] transition-colors ${showRoads ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500 line-through"}`}
                >
                  {t.leftSidebar.legendRoads}
                </span>
              </div>
              {/* Buildings */}
              <div className="flex items-center gap-3">
                <LegendDot
                  color="bg-cyan-400"
                  glow="rgba(34,211,238,0.7)"
                  active={showBuildings}
                />
                <span
                  className={`text-[12px] transition-colors ${showBuildings ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500 line-through"}`}
                >
                  {t.leftSidebar.legendBuildings}
                </span>
              </div>
            </div>
          </div>

          <Separator.Root className="neon-divider mx-5 mb-4" />

          {/* Stats / Info Cards */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-3.5 h-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Area
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Lon",
                  value: "110.38°E",
                  color: "from-indigo-500/20 to-indigo-500/5",
                },
                {
                  label: "Lat",
                  value: "7.78°S",
                  color: "from-cyan-500/20 to-cyan-500/5",
                },
                {
                  label: "Region",
                  value: "DIY",
                  color: "from-violet-500/20 to-violet-500/5",
                },
                {
                  label: "Layers",
                  value:
                    [showOrtho, showRoads, showBuildings].filter(Boolean)
                      .length + "/3",
                  color: "from-rose-500/20 to-rose-500/5",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl p-2.5 bg-gradient-to-br ${item.color} border border-white/10 dark:border-white/5`}
                >
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex w-1.5 touch-none select-none flex-col px-px py-2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* ── Footer ─────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 py-3 neon-divider">
        <div className="pt-3 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Daerah Istimewa Yogyakarta
          </p>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-[10px] text-emerald-400 font-semibold">
              LIVE
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
}
