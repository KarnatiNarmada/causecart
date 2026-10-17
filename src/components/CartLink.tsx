"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="rounded-full border border-gray-600 px-4 py-1.5 text-sm hover:bg-gray-800"
    >
      Cart ({itemCount})
    </Link>
  );
}