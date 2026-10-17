"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { placeOrder } from "@/app/checkout/actions";
import { formatCents } from "@/lib/donation";

type CauseOption = {
  id: number;
  name: string;
  city: string;
  state: string;
  type: string;
};

export function CheckoutForm({ causes }: { causes: CauseOption[] }) {
  const { items, subtotalCents, clearCart } = useCart();
  const router = useRouter();
  const [causeId, setCauseId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="mt-6 text-gray-400">
        Your cart is empty.{" "}
        <Link href="/products" className="underline">
          Continue shopping
        </Link>
      </p>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await placeOrder({
        causeId: Number(causeId),
        email,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      if (result.ok) {
        clearCart();
        router.push(`/orders/${result.orderId}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div>
        <label htmlFor="cause" className="block text-sm font-medium">
          Choose a cause to support
        </label>
        <select
          id="cause"
          required
          value={causeId}
          onChange={(event) => setCauseId(event.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          <option value="" disabled>
            Select a cause…
          </option>
          {causes.map((cause) => (
            <option key={cause.id} value={cause.id}>
              {cause.name} — {cause.city}, {cause.state}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email for your receipt
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />
      </div>

      <div className="rounded-xl border border-gray-800 p-4">
        <ul className="space-y-1 text-sm text-gray-300">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCents(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-800 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatCents(subtotalCents)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          50% of the profit from this order goes to your chosen cause. You&apos;ll see the
          exact amount on your receipt.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}