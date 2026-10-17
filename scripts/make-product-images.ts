import "dotenv/config";
import { mkdirSync, writeFileSync } from "fs";
import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_COLORS: Record<Category, { from: string; to: string }> = {
  HOME: { from: "#fef3c7", to: "#f59e0b" },
  BEAUTY: { from: "#fce7f3", to: "#ec4899" },
  JEWELRY: { from: "#ede9fe", to: "#8b5cf6" },
  PET: { from: "#d1fae5", to: "#10b981" },
  COFFEE: { from: "#ffedd5", to: "#b45309" },
};

const PRODUCT_ICONS: Record<string, string> = {
  "ceramic-mug": "🍵",
  "linen-pillow-cover": "🛋️",
  "cedar-sage-candle": "🕯️",
  "shea-hand-cream": "🧴",
  "lavender-bath-salts": "🛁",
  "bamboo-hair-brush": "🪮",
  "silver-studs": "💎",
  "beaded-bracelet": "📿",
  "pendant-necklace": "✨",
  "rope-tug-toy": "🪢",
  "pb-dog-treats": "🦴",
  "cozy-pet-bed": "🐕",
  "morning-blend": "☕",
  "espresso-beans": "🫘",
  "cold-brew-kit": "🧊",
};

function makeSvg(icon: string, colors: { from: string; to: string }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.from}"/>
      <stop offset="1" stop-color="${colors.to}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="300" cy="300" r="170" fill="#ffffff" fill-opacity="0.35"/>
  <text x="300" y="300" font-size="170" text-anchor="middle" dominant-baseline="central">${icon}</text>
</svg>`;
}

async function main() {
  mkdirSync("public/products", { recursive: true });

  const products = await prisma.product.findMany();

  for (const product of products) {
    const icon = PRODUCT_ICONS[product.slug] ?? "🛍️";
    const svg = makeSvg(icon, CATEGORY_COLORS[product.category]);
    writeFileSync(`public/products/${product.slug}.svg`, svg);

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: `/products/${product.slug}.svg` },
    });
  }

  console.log(`Created ${products.length} product images`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());