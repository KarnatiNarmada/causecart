import { AddToCartButton } from "@/components/AddToCartButton";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateOrderTotals, formatCents, DONATION_SHARE } from "@/lib/donation";

type Params = Promise<{ slug: string }>;

export default function ProductPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/products" className="text-sm text-gray-400 underline">
        ← Back to shop
      </Link>

      <Suspense fallback={<p className="mt-8 text-gray-400">Loading product…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ProductDetails({ params }: { params: Params }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const profitCents = product.priceCents - product.costCents;
  const { donationCents } = calculateOrderTotals([
    {
      quantity: 1,
      unitPriceCents: product.priceCents,
      unitCostCents: product.costCents,
    },
  ]);

  return (
    <div className="mt-6 grid gap-10 md:grid-cols-2">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="aspect-square w-full rounded-2xl object-cover"
      />

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {product.category}
        </p>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-medium">{formatCents(product.priceCents)}</p>
        <p className="text-gray-300">{product.description}</p>

        <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/40 p-4">
          <p className="font-semibold text-emerald-300">
            Your purchase gives {formatCents(donationCents)}
          </p>
          <p className="mt-1 text-sm text-gray-300">
            {DONATION_SHARE * 100}% of this item&apos;s {formatCents(profitCents)} profit
            goes to the cause you choose at checkout.
          </p>
        </div>

        <p className="text-sm text-gray-400">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>

            <AddToCartButton
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.imageUrl,
            priceCents: product.priceCents,
          }}
          disabled={product.stock <= 0}
        />
      </div>
    </div>
  );
}