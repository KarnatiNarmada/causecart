# CauseCart

**A shop-to-give e-commerce store: 50% of the profit from every order goes to a local school, team, or nonprofit the shopper chooses.**

**Live demo:** https://causecart.vercel.app

Built with Next.js, React, TypeScript, PostgreSQL, Prisma, Docker, and Vercel.

---

## Features

- **Product catalog**: search, category filter, and sorting, with filters kept in the URL so results are shareable and bookmarkable
- **Product pages**: price, description, and exactly how much the item gives to your cause
- **Shopping cart**: updates instantly across the site and persists across page refreshes
- **Checkout**: pick a cause, place the order, and get a receipt showing the exact donation
- **Cause directory**: searchable by name, city, and type, with live fundraising progress toward each goal
- **Admin dashboard**: revenue, profit, donations, orders, average order value, a 30-day donations chart, top products, and donations by cause

## How the donation works

Donations are calculated from **net profit**, not revenue:

```
profit   = (price − cost) × quantity, summed across the order
donation = 50% of profit, rounded down to the cent
```

Each order item stores the **price and cost at the time of purchase**, so historical orders and donation totals stay accurate even if product prices change later.

## Engineering decisions

| Decision | Why |
|---|---|
| **Server-side pricing at checkout** | The browser sends only product IDs and quantities. A Next.js Server Action loads real prices from the database and calculates totals, so prices can't be tampered with in the browser. |
| **Stock decrement inside a transaction** | `updateMany ... where stock >= quantity` inside `prisma.$transaction` means two shoppers can't buy the last item at the same time, and a failed step rolls back the whole order. |
| **Money stored as integer cents** | Avoids floating-point rounding errors (`0.1 + 0.2 ≠ 0.3`). |
| **One shared donation function** | `calculateOrderTotals` is used by checkout, the seed script, and the product pages, so the business rule lives in one place. |
| **SQL aggregation for analytics** | `GROUP BY`, `LEFT JOIN`, and `generate_series` compute dashboard numbers in single queries (no N+1 queries), and days with no orders still appear as $0. |
| **Server Components by default** | Pages fetch data on the server; only interactive pieces (cart, buttons, checkout form) are Client Components, so very little JavaScript is sent to the browser. |
| **Cache Components + Suspense** | Static page shells render instantly while live data streams in (Next.js 16 Partial Prerendering). |
| **Validated URL input** | Filter and sort values from the URL are checked against allowed values before they reach a query. |
| **Privacy on public pages** | Cause pages show donation amounts and dates, never customer emails. |
| **Custom SVG chart** | The dashboard chart is drawn with plain SVG on the server, with no chart library, plus an accessible table view. |

## Tech stack

| Layer | Tools |
|---|---|
| Front end | React, Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Back end | Next.js Server Components and Server Actions |
| Database | PostgreSQL, Prisma ORM and migrations |
| Local development | Docker Compose (Postgres 16) |
| Deployment | Vercel, with managed Postgres (Neon) |

## Data model

```
Cause  1 ──── * Order  1 ──── * OrderItem  * ──── 1  Product
```

- **Product**: name, category, price, cost, stock
- **Cause**: name, type (School, PTA, Sports, Arts, Nonprofit), city, goal
- **Order**: cause, subtotal, profit, donation, customer email
- **OrderItem**: product, quantity, unit price and cost at time of purchase

## Run it locally

Requirements: Node.js 20.9+ and Docker Desktop.

```bash
git clone https://github.com/KarnatiNarmada/causecart.git
cd causecart
npm install

# Start Postgres in Docker
docker compose up -d

# Point the app at the local database
echo 'DATABASE_URL="postgresql://causecart:causecart@localhost:5432/causecart?schema=public"' > .env

# Create the tables and load sample data
npx prisma migrate dev
npx tsx prisma/seed.ts
npx tsx scripts/make-product-images.ts

# Start the app at http://localhost:3000
npm run dev
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                 Home page with live impact stats
│   ├── products/                Catalog and product detail pages
│   ├── cart/                    Cart page
│   ├── checkout/                Checkout page and placeOrder Server Action
│   ├── orders/[id]/             Order receipt
│   ├── causes/                  Cause directory and cause pages
│   └── admin/                   Dashboard
├── components/                  ProductCard, CartProvider, CheckoutForm, charts, …
└── lib/
    ├── donation.ts              Donation rule and money formatting
    ├── analytics.ts             Dashboard SQL queries
    └── prisma.ts                Shared database client
prisma/
├── schema.prisma                Data model
├── migrations/                  SQL migrations
└── seed.ts                      Sample products, causes, and orders
```

## Known limitations and next steps

- **No authentication yet.** The admin dashboard is public for this demo; next step is an admin login.
- **Payments are simulated.** Checkout saves the order without charging a card; a real store would integrate a payment provider.
- **Receipts aren't emailed.** The email is stored with the order; sending would use an email service.
- **Order pages use sequential IDs.** With accounts, receipts would be limited to the order's owner.
- **Tests.** Add unit tests for `calculateOrderTotals` and integration tests for checkout.

---

*Sample causes are fictional organizations. Built by [Narmada Karnati](https://www.linkedin.com/in/narmada-karnati-b7b90a190).*