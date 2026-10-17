import { Suspense } from "react";
import { connection } from "next/server";
import { formatCents } from "@/lib/donation";
import {
  getDailyDonations,
  getDonationsByCause,
  getKpis,
  getTopProducts,
} from "@/lib/analytics";
import { StatTile } from "@/components/dashboard/StatTile";
import { DailyColumnChart } from "@/components/dashboard/DailyColumnChart";
import { RankedBars } from "@/components/dashboard/RankedBars";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-400">Sales and giving across all causes</p>

      <Suspense fallback={<p className="mt-8 text-gray-400">Loading dashboard…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  await connection();

  const [kpis, daily, topProducts, causes] = await Promise.all([
    getKpis(),
    getDailyDonations(30),
    getTopProducts(5),
    getDonationsByCause(),
  ]);

  const last30DaysCents = daily.reduce((sum, row) => sum + row.cents, 0);

  return (
    <>
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <div className="col-span-2">
          <StatTile
            hero
            label="Total donated to causes"
            value={formatCents(kpis.donationCents)}
            hint="50% of net profit"
          />
        </div>
        <StatTile label="Revenue" value={formatCents(kpis.revenueCents)} />
        <StatTile label="Profit" value={formatCents(kpis.profitCents)} />
        <StatTile label="Orders" value={kpis.orderCount.toLocaleString("en-US")} />
        <StatTile label="Avg order" value={formatCents(kpis.averageOrderCents)} />
      </section>

      <section className="mt-8 rounded-2xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold">Donations per day</h2>
        <p className="text-sm text-gray-400">
          Last 30 days · {formatCents(last30DaysCents)} total
        </p>
        <div className="mt-4">
          <DailyColumnChart
            data={daily}
            label="Column chart of donations per day over the last 30 days"
          />
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-400">View as table</summary>
          <table className="mt-2 w-full max-w-sm text-left">
            <thead>
              <tr className="text-gray-400">
                <th className="py-1 font-medium">Day</th>
                <th className="py-1 text-right font-medium">Donated</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((row) => (
                <tr key={row.day.toISOString()} className="border-t border-gray-800">
                  <td className="py-1">
                    {row.day.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </td>
                  <td className="py-1 text-right">{formatCents(row.cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold">Top products by revenue</h2>
          <div className="mt-4">
            <RankedBars
              items={topProducts.map((product) => ({
                id: product.id,
                label: product.name,
                valueCents: product.revenueCents,
                detail: `${product.units} units sold`,
              }))}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold">Donations by cause</h2>
          <div className="mt-4">
            <RankedBars
              items={causes.map((cause) => ({
                id: cause.id,
                label: cause.name,
                valueCents: cause.raisedCents,
                detail: `${Math.round((cause.raisedCents / cause.goalCents) * 100)}% of ${formatCents(cause.goalCents)} goal · ${cause.orders} orders`,
              }))}
            />
          </div>
        </section>
      </div>
    </>
  );
}