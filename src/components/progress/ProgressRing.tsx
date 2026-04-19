"use client";

export function ProgressRing({
  value,
  label,
  size = 72,
  stroke = 6,
}: {
  value: number;
  label: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="text-muted"
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          r={r}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-destructive transition-[stroke-dashoffset]"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          r={r}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground">{Math.round(value)}%</span>
    </div>
  );
}
