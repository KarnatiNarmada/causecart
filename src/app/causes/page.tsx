import { Suspense } from "react";
import Link from "next/link";
import { CauseType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/donation";
import { ProgressBar } from "@/components/ProgressBar";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function readFilters(params: Awaited<SearchParams>) {
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const rawType = typeof params.type === "string" ? params.type : "";
  const type = (Object.values(CauseType) as string[]).includes(rawType)
    ? (rawType as CauseType)
    : undefined;
  return { q, type };
}

function formatLabel(value: string) {
  return value === "PTA" ? "PTA" : value.charAt(0) + value.slice(1).toLowerCase();
}

export default function CausesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Causes you can support</h1>
      <p className="mt-2 text-gray-400">
        Pick a school, team, or nonprofit at checkout. 50% of profit goes to them.
      </p>

      <Suspense fallback={null}>
        <CauseFilters searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<p className="mt-8 text-gray-400">Loading causes…</p>}>
        <CauseList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CauseFilters({ searchParams }: { searchParams: SearchParams }) {
  const { q, type } = readFilters(await searchParams);

  return (
    <form method="GET" className="mt-6 flex flex-wrap items-center gap-3">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search by name or city…"
        className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
      />
      <select
        name="type"
        defaultValue={type ?? ""}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
      >
        <option value="">All types</option>
        {Object.values(CauseType).map((value) => (
          <option key={value} value={value}>
            {formatLabel(value)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
      >
        Search
      </button>
      <Link href="/causes" className="text-sm text-gray-400 underline">
        Clear
      </Link>
    </form>
  );
}

async function CauseList({ searchParams }: { searchParams: SearchParams }) {
  const { q, type } = readFilters(await searchParams);

  const where: Prisma.CauseWhereInput = {
    ...(type ? { type } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const causes = await prisma.cause.findMany({ where, orderBy: { name: "asc" } });

  if (causes.length === 0) {
    return <p className="mt-8 text-gray-400">No causes match your search.</p>;
  }

  // One query: total donations and order count for each cause (SQL GROUP BY)
  const totals = await prisma.order.groupBy({
    by: ["causeId"],
    where: { causeId: { in: causes.map((cause) => cause.id) } },
    _sum: { donationCents: true },
    _count: { _all: true },
  });
  const totalsByCause = new Map(totals.map((row) => [row.causeId, row]));

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      {causes.map((cause) => {
        const raisedCents = totalsByCause.get(cause.id)?._sum.donationCents ?? 0;
        const supporters = totalsByCause.get(cause.id)?._count._all ?? 0;

        return (
          <Link
            key={cause.id}
            href={`/causes/${cause.slug}`}
            className="block rounded-2xl border border-gray-800 p-5 transition hover:border-emerald-600"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{cause.name}</h2>
              <span className="shrink-0 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
                {formatLabel(cause.type)}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {cause.city}, {cause.state}
            </p>
            <p className="mt-2 text-sm text-gray-300">{cause.description}</p>

            <div className="mt-4">
              <ProgressBar
                valueCents={raisedCents}
                goalCents={cause.goalCents}
                label={`${cause.name} fundraising progress`}
              />
              <p className="mt-2 text-sm">
                <span className="font-semibold text-emerald-400">
                  {formatCents(raisedCents)}
                </span>{" "}
                <span className="text-gray-400">
                  raised of {formatCents(cause.goalCents)} · {supporters} orders
                </span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}   