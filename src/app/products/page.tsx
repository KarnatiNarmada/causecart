import { Suspense } from "react";
import Link from "next/link";
import { Category, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const SORT_OPTIONS = {
  name: { label: "Name (A–Z)", orderBy: { name: "asc" } },
  price_asc: { label: "Price: low to high", orderBy: { priceCents: "asc" } },
  price_desc: { label: "Price: high to low", orderBy: { priceCents: "desc" } },
  newest: { label: "Newest", orderBy: { createdAt: "desc" } },
} satisfies Record<
  string,
  { label: string; orderBy: Prisma.ProductOrderByWithRelationInput }
>;

type SortKey = keyof typeof SORT_OPTIONS;

function readFilters(params: Awaited<SearchParams>) {
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const rawCategory = typeof params.category === "string" ? params.category : "";
  const category = (Object.values(Category) as string[]).includes(rawCategory)
    ? (rawCategory as Category)
    : undefined;

  const rawSort = typeof params.sort === "string" ? params.sort : "name";
  const sort: SortKey = rawSort in SORT_OPTIONS ? (rawSort as SortKey) : "name";

  return { q, category, sort };
}

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Shop</h1>
      <p className="mt-2 text-gray-400">
        50% of profit goes to the cause you choose
      </p>

      <Suspense fallback={null}>
        <FilterBar searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<p className="mt-8 text-gray-400">Loading products…</p>}>
        <ProductGrid searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function FilterBar({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, sort } = readFilters(await searchParams);

  return (
    <form method="GET" className="mt-6 flex flex-wrap items-center gap-3">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder="Search products…"
        className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
      />

      <select
        name="category"
        defaultValue={category ?? ""}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
      >
        <option value="">All categories</option>
        {Object.values(Category).map((value) => (
          <option key={value} value={value}>
            {formatLabel(value)}
          </option>
        ))}
      </select>

      <select
        name="sort"
        defaultValue={sort}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
      >
        {Object.entries(SORT_OPTIONS).map(([key, option]) => (
          <option key={key} value={key}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
      >
        Apply
      </button>

      <Link href="/products" className="text-sm text-gray-400 underline">
        Clear
      </Link>
    </form>
  );
}

async function ProductGrid({ searchParams }: { searchParams: SearchParams }) {
  const { q, category, sort } = readFilters(await searchParams);

  const where: Prisma.ProductWhereInput = {
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: SORT_OPTIONS[sort].orderBy,
  });

  if (products.length === 0) {
    return (
      <p className="mt-8 text-gray-400">
        No products match your filters.{" "}
        <Link href="/products" className="underline">
          Clear filters
        </Link>
      </p>
    );
  }

  return (
    <>
      <p className="mt-6 text-sm text-gray-400">{products.length} products</p>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}