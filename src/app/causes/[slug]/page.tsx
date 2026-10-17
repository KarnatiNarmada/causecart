import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/donation";
import { ProgressBar } from "@/components/ProgressBar";

type Params = Promise<{ slug: string }>;

export default function CausePage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/causes" className="text-sm text-gray-400 underline">
        ← All causes
      </Link>
      <Suspense fallback={<p className="mt-8 text-gray-400">Loading…</p>}>
        <CauseDetails params={params} />
      </Suspense>
    </main>
  );
}

async function CauseDetails({ params }: { params: Params }) {
  const { slug } = await params;

  const cause = await prisma.cause.findUnique({ where: { slug } });
  if (!cause) notFound();

  const stats = await prisma.order.aggregate({
    where: { causeId: cause.id },
    _sum: { donationCents: true },
    _count: { _all: true },
  });
  const raisedCents = stats._sum.donationCents ?? 0;
  const percent = Math.min(100, Math.round((raisedCents / cause.goalCents) * 100));

  const recentOrders = await prisma.order.findMany({
    where: { causeId: cause.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, donationCents: true, createdAt: true },
  });

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-400">
        {cause.city}, {cause.state}
      </p>
      <h1 className="text-3xl font-bold">{cause.name}</h1>
      <p className="mt-3 text-gray-300">{cause.description}</p>

      <div className="mt-8 rounded-2xl border border-gray-800 p-6">
        <p className="text-4xl font-bold text-emerald-400">{formatCents(raisedCents)}</p>
        <p className="mt-1 text-gray-400">
          raised of {formatCents(cause.goalCents)} goal · {percent}% ·{" "}
          {stats._count._all} orders
        </p>
        <div className="mt-4">
          <ProgressBar
            valueCents={raisedCents}
            goalCents={cause.goalCents}
            label={`${cause.name} fundraising progress`}
          />
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Recent support</h2>
      {recentOrders.length === 0 ? (
        <p className="mt-2 text-gray-400">No orders yet. Be the first!</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-800">
          {recentOrders.map((order) => (
            <li key={order.id} className="flex justify-between py-3 text-sm">
              <span className="text-gray-300">
                {order.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="font-medium text-emerald-400">
                +{formatCents(order.donationCents)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/products"
        className="mt-8 inline-block rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
      >
        Shop to support {cause.name}
      </Link>
    </div>
  );
}