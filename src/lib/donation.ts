// 50% of net profit goes to the shopper's chosen cause
export const DONATION_SHARE = 0.5;

export type LineItem = {
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number;
};

export function calculateOrderTotals(items: LineItem[]) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );
  const profitCents = items.reduce(
    (sum, item) => sum + (item.unitPriceCents - item.unitCostCents) * item.quantity,
    0
  );
  const donationCents = Math.floor(Math.max(profitCents, 0) * DONATION_SHARE);

  return { subtotalCents, profitCents, donationCents };
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}