"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatCents } from "@/lib/donation";

export default function CartPage() {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Your cart</h1>
        <p className="mt-4 text-gray-400">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your cart</h1>

      <ul className="mt-6 divide-y divide-gray-800">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <Link href={`/products/${item.slug}`} className="font-semibold hover:underline">
                {item.name}
              </Link>
              <p className="text-sm text-gray-400">{formatCents(item.priceCents)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="h-8 w-8 rounded border border-gray-600"
                aria-label={`Decrease ${item.name}`}
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="h-8 w-8 rounded border border-gray-600"
                aria-label={`Increase ${item.name}`}
              >
                +
              </button>
            </div>

            <p className="w-20 text-right font-medium">
              {formatCents(item.priceCents * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-gray-400 underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-6">
        <p className="text-lg">Subtotal</p>
        <p className="text-2xl font-bold">{formatCents(subtotalCents)}</p>
      </div>
            <p className="mt-2 text-sm text-gray-400">
        Choose your cause and see your donation at checkout.
      </p>
      <Link
        href="/checkout"
        className="mt-6 block rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-700"
      >
        Proceed to checkout
      </Link>
    </main>
  );
}