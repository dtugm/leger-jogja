type StatColor = "blue" | "green" | "yellow" | "red" | "gray";

interface StatCardProps {
  value: number | string;
  label: string;
  color: StatColor;
}

const colorMap: Record<StatColor, string> = {
  blue:   "text-primary-500",
  green:  "text-[var(--color-success)]",
  yellow: "text-[var(--color-warning)]",
  red:    "text-[var(--color-danger)]",
  gray:   "text-muted-foreground",
};

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-5">
      <p className={`text-2xl sm:text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

interface StatCardsProps {
  stats: { value: number | string; label: string; color: StatColor }[];
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {stats.map((s) => (
        <StatCard key={s.label} value={s.value} label={s.label} color={s.color} />
      ))}
    </div>
  );
}