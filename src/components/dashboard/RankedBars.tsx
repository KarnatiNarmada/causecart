type RankedItem = {
  id: number;
  label: string;
  valueCents: number;
  detail: string;
};

function formatDollars(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function RankedBars({ items }: { items: RankedItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.valueCents));

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} title={`${item.label}: ${formatDollars(item.valueCents)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 font-medium">{formatDollars(item.valueCents)}</span>
          </div>
          <div className="mt-1.5 h-3 w-full">
            <div
              className="h-full rounded-r bg-emerald-600"
              style={{ width: `${Math.max(1, (item.valueCents / max) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}