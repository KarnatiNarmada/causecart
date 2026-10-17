import "dotenv/config";
import { PrismaClient, Category, CauseType } from "@prisma/client";
import { calculateOrderTotals } from "../src/lib/donation";

const prisma = new PrismaClient();

const products = [
  { name: "Hand-Thrown Ceramic Mug", slug: "ceramic-mug", category: Category.HOME, priceCents: 1800, costCents: 700, description: "Stoneware mug, glazed by hand. Holds 12 oz." },
  { name: "Linen Throw Pillow Cover", slug: "linen-pillow-cover", category: Category.HOME, priceCents: 3200, costCents: 1300, description: "Washed linen cover with a hidden zipper. 18 x 18 in." },
  { name: "Cedar & Sage Soy Candle", slug: "cedar-sage-candle", category: Category.HOME, priceCents: 2400, costCents: 800, description: "Hand-poured soy wax with a 40-hour burn time." },
  { name: "Shea Butter Hand Cream", slug: "shea-hand-cream", category: Category.BEAUTY, priceCents: 1400, costCents: 500, description: "Rich, fast-absorbing cream for dry hands." },
  { name: "Lavender Bath Salts", slug: "lavender-bath-salts", category: Category.BEAUTY, priceCents: 1600, costCents: 550, description: "Epsom and sea salt blend with lavender oil." },
  { name: "Bamboo Hair Brush", slug: "bamboo-hair-brush", category: Category.BEAUTY, priceCents: 2000, costCents: 800, description: "Gentle bristles on a sustainable bamboo handle." },
  { name: "Sterling Silver Stud Earrings", slug: "silver-studs", category: Category.JEWELRY, priceCents: 4500, costCents: 1800, description: "Minimal 925 sterling silver studs." },
  { name: "Beaded Friendship Bracelet", slug: "beaded-bracelet", category: Category.JEWELRY, priceCents: 1500, costCents: 400, description: "Adjustable bracelet with glass beads." },
  { name: "Gold-Tone Pendant Necklace", slug: "pendant-necklace", category: Category.JEWELRY, priceCents: 3800, costCents: 1500, description: "Delicate pendant on an 18-inch chain." },
  { name: "Rope Tug Toy", slug: "rope-tug-toy", category: Category.PET, priceCents: 1200, costCents: 400, description: "Braided cotton rope for tug and fetch." },
  { name: "Peanut Butter Dog Treats", slug: "pb-dog-treats", category: Category.PET, priceCents: 1300, costCents: 500, description: "Baked treats with five simple ingredients." },
  { name: "Cozy Pet Bed", slug: "cozy-pet-bed", category: Category.PET, priceCents: 5500, costCents: 2600, description: "Plush bolster bed with a washable cover." },
  { name: "Morning Blend Coffee (12 oz)", slug: "morning-blend", category: Category.COFFEE, priceCents: 1500, costCents: 650, description: "Medium roast with notes of caramel and cocoa." },
  { name: "Dark Roast Espresso Beans", slug: "espresso-beans", category: Category.COFFEE, priceCents: 1700, costCents: 750, description: "Bold whole beans for espresso or drip." },
  { name: "Cold Brew Pitcher Kit", slug: "cold-brew-kit", category: Category.COFFEE, priceCents: 2800, costCents: 1200, description: "Glass pitcher with a fine-mesh filter." },
];

const causes = [
  { name: "Maple Ridge Elementary PTA", slug: "maple-ridge-pta", type: CauseType.PTA, city: "Stow", state: "OH", goalCents: 500000, description: "Funding classroom supplies and field trips." },
  { name: "Riverside Robotics Club", slug: "riverside-robotics", type: CauseType.SCHOOL, city: "Kent", state: "OH", goalCents: 300000, description: "Sending our team to the state robotics competition." },
  { name: "Summit Youth Soccer League", slug: "summit-youth-soccer", type: CauseType.SPORTS, city: "Akron", state: "OH", goalCents: 600000, description: "New uniforms and field equipment for 300 players." },
  { name: "Falls Community Theater", slug: "falls-community-theater", type: CauseType.ARTS, city: "Cuyahoga Falls", state: "OH", goalCents: 400000, description: "Costumes and lighting for our spring musical." },
  { name: "Hudson Middle School Band", slug: "hudson-ms-band", type: CauseType.SCHOOL, city: "Hudson", state: "OH", goalCents: 350000, description: "Repairing and replacing student instruments." },
  { name: "Northeast Ohio Animal Rescue", slug: "neo-animal-rescue", type: CauseType.NONPROFIT, city: "Akron", state: "OH", goalCents: 800000, description: "Vet care and food for animals awaiting adoption." },
  { name: "Brookfield Hawks Youth Baseball", slug: "brookfield-hawks", type: CauseType.SPORTS, city: "Kent", state: "OH", goalCents: 450000, description: "Field upkeep and registration scholarships." },
  { name: "Northside Community Food Pantry", slug: "northside-food-pantry", type: CauseType.NONPROFIT, city: "Stow", state: "OH", goalCents: 1000000, description: "Stocking shelves for local families in need." },
];

// Same "random" numbers every run, so the sample data is repeatable
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

async function main() {
  // Clear old data (children first, because of the foreign keys)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.cause.deleteMany();

  await prisma.product.createMany({
    data: products.map((p) => ({
      ...p,
            imageUrl: `/products/${p.slug}.svg`,
    })),
  });
  await prisma.cause.createMany({ data: causes });

  const allProducts = await prisma.product.findMany();
  const allCauses = await prisma.cause.findMany();
  const rand = seededRandom(42);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

  for (let i = 0; i < 60; i++) {
    const cause = pick(allCauses);
    const itemCount = 1 + Math.floor(rand() * 3);

    const items = Array.from({ length: itemCount }, () => {
      const product = pick(allProducts);
      return {
        productId: product.id,
        quantity: 1 + Math.floor(rand() * 2),
        unitPriceCents: product.priceCents,
        unitCostCents: product.costCents,
      };
    });

    const totals = calculateOrderTotals(items);
    const daysAgo = Math.floor(rand() * 60);

    await prisma.order.create({
      data: {
        causeId: cause.id,
        customerEmail: `shopper${i + 1}@example.com`,
        ...totals,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        items: { create: items },
      },
    });
  }

  const orderCount = await prisma.order.count();
  console.log(
    `Seeded ${allProducts.length} products, ${allCauses.length} causes, ${orderCount} orders`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());