type DailyPoint = { day: Date; cents: number };

type DailyColumnChartProps = {
  data: DailyPoint[];
  label: string;
};

const WIDTH = 720;
const HEIGHT = 240;
const PAD = { top: 16, right: 8, bottom: 28, left: 52 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  const step = steps.find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

function compactDollars(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fullDollars(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function shortDate(day: Date) {
  return day.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// A column with a 4px rounded top and a square base
function columnPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  const base = y + h;
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${base} Z`;
}

export function DailyColumnChart({ data, label }: DailyColumnChartProps) {
  const max = niceMax(Math.max(0, ...data.map((d) => d.cents)));
  const ticks = [0, max / 2, max];
  const slot = PLOT_W / Math.max(1, data.length);
  const barW = Math.min(24, Math.max(2, slot - 4));
  const y = (cents: number) => PAD.top + PLOT_H - (cents / max) * PLOT_H;
  const labelIndexes = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} className="h-auto w-full">
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(tick)}
            y2={y(tick)}
            className="stroke-gray-800"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 8}
            y={y(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-400 text-[11px]"
          >
            {compactDollars(tick)}
          </text>
        </g>
      ))}

      {data.map((point, i) => {
        const x = PAD.left + i * slot + (slot - barW) / 2;
        const top = y(point.cents);
        const h = PAD.top + PLOT_H - top;

        return (
          <g key={point.day.toISOString()} className="group">
            <title>{`${shortDate(point.day)}: ${fullDollars(point.cents)}`}</title>
            <rect
              x={PAD.left + i * slot}
              y={PAD.top}
              width={slot}
              height={PLOT_H}
              fill="transparent"
            />
            {h > 0 && (
              <path
                d={columnPath(x, top, barW, h)}
                className="fill-emerald-600 transition-opacity group-hover:opacity-70"
              />
            )}
            {labelIndexes.has(i) && (
              <text
                x={i === 0 ? x : i === data.length - 1 ? x + barW : x + barW / 2}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                className="fill-gray-400 text-[11px]"
              >
                {shortDate(point.day)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}   