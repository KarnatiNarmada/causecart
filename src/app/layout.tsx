import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { CartLink } from "@/components/CartLink";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CauseCart",
  description: "Shop everyday products. 50% of profit supports local causes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <header className="border-b border-gray-800">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <Link href="/products" className="text-xl font-bold">
                Cause<span className="text-emerald-500">Cart</span>
              </Link>
              <CartLink />
            </div>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}