type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  hero?: boolean;
};

export function StatTile({ label, value, hint, hero = false }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-gray-800 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={hero ? "mt-1 text-5xl font-semibold" : "mt-1 text-2xl font-semibold"}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}