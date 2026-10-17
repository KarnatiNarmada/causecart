"use server";

import { prisma } from "@/lib/prisma";
import { calculateOrderTotals } from "@/lib/donation";

type CheckoutInput = {
  causeId: number;
  email: string;
  items: { productId: number; quantity: number }[];
};

type CheckoutResult =
  | { ok: true; orderId: number }
  | { ok: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  // 1. Validate what the browser sent
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!Number.isInteger(input.causeId)) {
    return { ok: false, error: "Please choose a cause to support." };
  }

  const quantities = new Map<number, number>();
  for (const item of input.items) {
    if (
      !Number.isInteger(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    ) {
      return { ok: false, error: "Your cart has an invalid item. Please refresh and try again." };
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  if (quantities.size === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  // 2. Load the REAL cause and products from the database
  const cause = await prisma.cause.findUnique({ where: { id: input.causeId } });
  if (!cause) {
    return { ok: false, error: "That cause no longer exists. Please pick another." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
  });
  if (products.length !== quantities.size) {
    return { ok: false, error: "Some items are no longer available. Please review your cart." };
  }

  // 3. Calculate totals using database prices, never browser prices
  const lineItems = products.map((product) => ({
    productId: product.id,
    quantity: quantities.get(product.id)!,
    unitPriceCents: product.priceCents,
    unitCostCents: product.costCents,
  }));
  const totals = calculateOrderTotals(lineItems);

  // 4. Reduce stock and save the order together: all or nothing
  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of lineItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          const name = products.find((p) => p.id === item.productId)?.name ?? "An item";
          throw new Error(`OUT_OF_STOCK:${name}`);
        }
      }

      return tx.order.create({
        data: {
          causeId: cause.id,
          customerEmail: email,
          ...totals,
          items: { create: lineItems },
        },
      });
    });

    return { ok: true, orderId: order.id };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("OUT_OF_STOCK:")) {
      const name = error.message.replace("OUT_OF_STOCK:", "");
      return { ok: false, error: `${name} doesn't have enough stock.` };
    }
    console.error("placeOrder failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}