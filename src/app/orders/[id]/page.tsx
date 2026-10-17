import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents, DONATION_SHARE } from "@/lib/donation";

type Params = Promise<{ id: string }>;

export default function OrderPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Suspense fallback={<p className="text-gray-400">Loading your order…</p>}>
        <OrderDetails params={params} />
      </Suspense>
    </main>
  );
}

async function OrderDetails({ params }: { params: Params }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      cause: true,
      items: { include: { product: true } },
    },
  });
  if (!order) notFound();

  return (
    <div>
      <p className="text-sm text-emerald-400">Order #{order.id} confirmed</p>
      <h1 className="mt-1 text-3xl font-bold">Thank you for shopping!</h1>

      <div className="mt-6 rounded-xl border border-emerald-700/40 bg-emerald-950/40 p-5">
        <p className="text-sm text-gray-300">Your order is giving</p>
        <p className="text-4xl font-bold text-emerald-300">
          {formatCents(order.donationCents)}
        </p>
        <p className="mt-1 text-gray-300">
          to <span className="font-semibold">{order.cause.name}</span> in {order.cause.city},{" "}
          {order.cause.state}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          That&apos;s {DONATION_SHARE * 100}% of this order&apos;s{" "}
          {formatCents(order.profitCents)} profit.
        </p>
      </div>

      <ul className="mt-6 divide-y divide-gray-800">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between py-3">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatCents(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-gray-800 pt-4 text-lg font-semibold">
        <span>Total paid</span>
        <span>{formatCents(order.subtotalCents)}</span>
      </div>

      <p className="mt-4 text-sm text-gray-400">
        A receipt would be sent to {order.customerEmail}.
      </p>

      <Link
        href="/products"
        className="mt-8 inline-block rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white"
      >
        Keep shopping
      </Link>
    </div>
  );
}