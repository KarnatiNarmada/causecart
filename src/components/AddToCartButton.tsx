"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/components/CartProvider";

type AddToCartButtonProps = {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
};

export function AddToCartButton({ product, disabled = false }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? "Out of stock" : justAdded ? "Added ✓" : "Add to cart"}
    </button>
  );
}