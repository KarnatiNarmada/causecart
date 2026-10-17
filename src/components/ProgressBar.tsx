type ProgressBarProps = {
  valueCents: number;
  goalCents: number;
  label: string;
};

export function ProgressBar({ valueCents, goalCents, label }: ProgressBarProps) {
  const percent =
    goalCents > 0 ? Math.min(100, Math.round((valueCents / goalCents) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-gray-700"
    >
      <div
        className="h-full rounded-full bg-emerald-500 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}