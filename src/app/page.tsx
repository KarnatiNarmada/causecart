import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { formatCents } from "@/lib/donation";
import { getDonationsByCause, getKpis } from "@/lib/analytics";
import { ProgressBar } from "@/components/ProgressBar";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Shop-to-give marketplace
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Shop everyday essentials. Fund your local schools and teams.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-gray-300">
          50% of the profit from every order goes to a school, team, or nonprofit you choose.
          Same products, same prices, more good in your community.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Start shopping
          </Link>
          <Link
            href="/causes"
            className="rounded-lg border border-gray-600 px-5 py-3 font-medium hover:bg-gray-800"
          >
            Find a cause
          </Link>
        </div>
      </section>

      <Suspense fallback={null}>
        <ImpactSection />
      </Suspense>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          <li className="rounded-2xl border border-gray-800 p-5">
            <p className="text-sm font-semibold text-emerald-400">Step 1</p>
            <p className="mt-1 text-lg font-semibold">Shop what you already buy</p>
            <p className="mt-2 text-sm text-gray-400">
              Home goods, beauty, jewelry, pet supplies, and coffee.
            </p>
          </li>
          <li className="rounded-2xl border border-gray-800 p-5">
            <p className="text-sm font-semibold text-emerald-400">Step 2</p>
            <p className="mt-1 text-lg font-semibold">Pick a cause at checkout</p>
            <p className="mt-2 text-sm text-gray-400">
              Choose a local school, PTA, team, arts group, or nonprofit.
            </p>
          </li>
          <li className="rounded-2xl border border-gray-800 p-5">
            <p className="text-sm font-semibold text-emerald-400">Step 3</p>
            <p className="mt-1 text-lg font-semibold">Half the profit goes to them</p>
            <p className="mt-2 text-sm text-gray-400">
              Your receipt shows exactly how much your order gave.
            </p>
          </li>
        </ol>
      </section>
    </main>
  );
}

async function ImpactSection() {
  await connection();

  const [kpis, causes] = await Promise.all([getKpis(), getDonationsByCause()]);
  const topCauses = causes.slice(0, 3);

  return (
    <section className="border-y border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-400">Given to local causes so far</p>
            <p className="mt-1 text-5xl font-semibold text-emerald-400">
              {formatCents(kpis.donationCents)}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              from {kpis.orderCount.toLocaleString("en-US")} orders across {causes.length} causes
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-400">Top causes right now</p>
            <ul className="mt-3 space-y-4">
              {topCauses.map((cause) => (
                <li key={cause.id}>
                  <Link href={`/causes/${cause.slug}`} className="group block">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium group-hover:underline">{cause.name}</span>
                      <span className="text-gray-400">
                        {formatCents(cause.raisedCents)} of {formatCents(cause.goalCents)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar
                        valueCents={cause.raisedCents}
                        goalCents={cause.goalCents}
                        label={`${cause.name} fundraising progress`}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}