interface PixelMeterProps {
  value: number; // 0..1
  squares?: number;
  color?: string;
  className?: string;
}

export default function PixelMeter({
  value,
  squares = 16,
  color = "#7fd6a6",
  className = "",
}: PixelMeterProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const filled = Math.round(clamped * squares);
  return (
    <div className={`flex gap-[3px] ${className}`} role="meter" aria-valuenow={Math.round(clamped * 100)} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({ length: squares }).map((_, i) => (
        <span
          key={i}
          className="h-4 flex-1 rounded-[3px] border-2 border-[var(--ink)]"
          style={{
            backgroundColor: i < filled ? color : "var(--muted)",
          }}
        />
      ))}
    </div>
  );
}
