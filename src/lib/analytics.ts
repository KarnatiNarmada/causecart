import { prisma } from "@/lib/prisma";

export async function getKpis() {
  const totals = await prisma.order.aggregate({
    _sum: { subtotalCents: true, profitCents: true, donationCents: true },
    _count: { _all: true },
  });

  const revenueCents = totals._sum.subtotalCents ?? 0;
  const orderCount = totals._count._all;

  return {
    revenueCents,
    profitCents: totals._sum.profitCents ?? 0,
    donationCents: totals._sum.donationCents ?? 0,
    orderCount,
    averageOrderCents: orderCount > 0 ? Math.round(revenueCents / orderCount) : 0,
  };
}

// One row per day for the last N days, including days with no orders (0)
export async function getDailyDonations(days = 30) {
  return prisma.$queryRaw<{ day: Date; cents: number }[]>`
    SELECT d.day::date AS day,
           COALESCE(SUM(o."donationCents"), 0)::int AS cents
    FROM generate_series(current_date - (${days}::int - 1), current_date, interval '1 day') AS d(day)
    LEFT JOIN "Order" o ON o."createdAt"::date = d.day::date
    GROUP BY d.day
    ORDER BY d.day
  `;
}

export async function getTopProducts(limit = 5) {
  return prisma.$queryRaw<
    { id: number; name: string; units: number; revenueCents: number }[]
  >`
    SELECT p.id,
           p.name,
           SUM(oi.quantity)::int AS units,
           SUM(oi.quantity * oi."unitPriceCents")::int AS "revenueCents"
    FROM "OrderItem" oi
    JOIN "Product" p ON p.id = oi."productId"
    GROUP BY p.id, p.name
    ORDER BY "revenueCents" DESC
    LIMIT ${limit}
  `;
}

export async function getDonationsByCause() {
  return prisma.$queryRaw<
    { id: number; name: string; slug: string; goalCents: number; raisedCents: number; orders: number }[]
  >`
    SELECT c.id,
           c.name,
            c.slug,
           c."goalCents",
           COALESCE(SUM(o."donationCents"), 0)::int AS "raisedCents",
           COUNT(o.id)::int AS orders
    FROM "Cause" c
    LEFT JOIN "Order" o ON o."causeId" = c.id
    GROUP BY c.id
    ORDER BY "raisedCents" DESC
  `;
}