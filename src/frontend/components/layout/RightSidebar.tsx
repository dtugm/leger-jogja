"use client";

import * as Switch from "@radix-ui/react-switch";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useTheme } from "next-themes";

import { useTranslation } from "@/lib/i18n";
import { useMapSettings } from "@/lib/map-settings";

// ─── Radix-powered Toggle Row ────────────────────────────────────────────────
function LayerRow({
  id,
  label,
  description,
  dotColor,
  glowColor,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  dotColor: string;
  glowColor: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <Tooltip.Provider delayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 cursor-default
              ${checked ? "bg-white/5 dark:bg-white/4" : "opacity-60"}`}
          >
            {/* Dot + text */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`
                  flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${dotColor}
                  ${checked ? `shadow-[0_0_8px_2px_${glowColor}] layer-dot-active` : "opacity-30"}
                `}
              />
              <div className="min-w-0">
                <p
                  className={`text-[13px] font-semibold leading-none mb-0.5
                    ${checked ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}
                  `}
                >
                  {label}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {description}
                </p>
              </div>
            </div>

            {/* Radix Switch */}
            <Switch.Root
              id={id}
              checked={checked}
              onCheckedChange={onChange}
              className="radix-switch-root flex-shrink-0"
              aria-label={label}
            >
              <Switch.Thumb className="radix-switch-thumb" />
            </Switch.Root>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="left"
            className="z-50 rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-900 text-slate-100 shadow-lg"
            sideOffset={8}
          >
            {checked ? "Click to hide" : "Click to show"}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="text-indigo-400 dark:text-indigo-300">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RightSidebar() {
  const { t, locale, toggleLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { settings, setShowOrtho, setShowRoads, setShowBuildings } =
    useMapSettings();
  const { showOrtho, showRoads, showBuildings } = settings;

  const isDark = theme === "dark";

  return (
    <aside className="glass-sidebar glass-sidebar-accent-top relative w-64 flex-shrink-0 flex flex-col h-full border-l z-10 overflow-y-auto animate-fade-in">
      {/* ── Layers ──────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4">
        <SectionHeader
          label={t.rightSidebar.layersTitle}
          icon={
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              />
            </svg>
          }
        />

        <div className="space-y-1">
          <LayerRow
            id="toggle-ortho"
            label={t.rightSidebar.orthoLabel}
            description={t.rightSidebar.orthoDesc}
            dotColor="bg-amber-400"
            glowColor="rgba(251,191,36,0.6)"
            checked={showOrtho}
            onChange={setShowOrtho}
          />
          <LayerRow
            id="toggle-roads"
            label={t.rightSidebar.roadsLabel}
            description={t.rightSidebar.roadsDesc}
            dotColor="bg-rose-400"
            glowColor="rgba(251,113,133,0.6)"
            checked={showRoads}
            onChange={setShowRoads}
          />
          <LayerRow
            id="toggle-buildings"
            label={t.rightSidebar.buildingsLabel}
            description={t.rightSidebar.buildingsDesc}
            dotColor="bg-cyan-400"
            glowColor="rgba(34,211,238,0.6)"
            checked={showBuildings}
            onChange={setShowBuildings}
          />
        </div>
      </div>

      {/* Neon divider */}
      <div className="neon-divider mx-4" />

      {/* ── Settings ────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-5">
        <SectionHeader
          label={t.rightSidebar.settingsTitle}
          icon={
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="3" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
              />
            </svg>
          }
        />

        <div className="space-y-2">
          {/* Theme */}
          <button
            id="btn-toggle-theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              bg-white/5 dark:bg-white/4 border border-white/10 dark:border-white/8
              hover:border-indigo-400/40 hover:bg-indigo-500/10
              transition-all duration-200 text-slate-600 dark:text-slate-300"
          >
            {isDark ? (
              <svg
                className="w-4 h-4 flex-shrink-0 text-indigo-300 group-hover:text-indigo-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 flex-shrink-0 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            )}
            <span className="text-[13px] font-medium">
              {isDark ? t.rightSidebar.darkMode : t.rightSidebar.lightMode}
            </span>
            {/* pill indicator */}
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 dark:text-indigo-200 font-bold">
              {isDark ? "DARK" : "LIGHT"}
            </span>
          </button>

          {/* Language */}
          <button
            id="btn-toggle-language"
            onClick={toggleLocale}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              bg-white/5 dark:bg-white/4 border border-white/10 dark:border-white/8
              hover:border-cyan-400/40 hover:bg-cyan-500/10
              transition-all duration-200 text-slate-600 dark:text-slate-300"
          >
            <svg
              className="w-4 h-4 flex-shrink-0 text-cyan-400 group-hover:text-cyan-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-[13px] font-medium">
              {t.rightSidebar.language}
            </span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase">
              {locale}
            </span>
          </button>
        </div>
      </div>

      {/* Corner glow decoration */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-32 h-32 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl" />
    </aside>
  );
}
