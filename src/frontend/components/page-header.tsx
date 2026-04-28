interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageHeader({ title, subtitle, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}