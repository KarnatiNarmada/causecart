import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <Suspense fallback={<p className="mt-6 text-gray-400">Loading…</p>}>
        <CheckoutLoader />
      </Suspense>
    </main>
  );
}

async function CheckoutLoader() {
  await connection();

  const causes = await prisma.cause.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true, state: true, type: true },
  });

  return <CheckoutForm causes={causes} />;
}