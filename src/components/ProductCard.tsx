import Link from "next/link";
import type { Product } from "@prisma/client";
import { calculateOrderTotals, formatCents } from "@/lib/donation";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { donationCents } = calculateOrderTotals([
    {
      quantity: 1,
      unitPriceCents: product.priceCents,
      unitCostCents: product.costCents,
    },
  ]);

   return (
    <Link href={`/products/${product.slug}`} className="block">
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:shadow-md">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />
        <div className="space-y-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {product.category}
          </p>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-base font-medium">{formatCents(product.priceCents)}</p>
          <p className="text-sm text-emerald-700">
            Gives {formatCents(donationCents)} to your cause
          </p>
        </div>
      </article>
    </Link>
  );
}