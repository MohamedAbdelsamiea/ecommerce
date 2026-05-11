import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL or DIRECT_URL found in environment.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 1299.00,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
    ],
    category: "Electronics",
    stock: 25,
  },
  {
    name: "Cotton Casual T-Shirt",
    slug: "cotton-casual-tshirt",
    description: "Comfortable 100% cotton t-shirt available in multiple colors. Machine washable and wrinkle-resistant.",
    price: 299.00,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
    ],
    category: "Fashion",
    stock: 100,
  },
  {
    name: "Stainless Steel Water Bottle",
    slug: "stainless-steel-water-bottle",
    description: "Double-walled vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. 750ml capacity.",
    price: 449.00,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800",
    ],
    category: "Home",
    stock: 60,
  },
  {
    name: "Leather Office Desk Organizer",
    slug: "leather-office-desk-organizer",
    description: "Elegant leather desk organizer with multiple compartments for pens, documents, and accessories. Fits any professional workspace.",
    price: 599.00,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
    ],
    category: "Office",
    stock: 35,
  },
  {
    name: "Smart Fitness Tracker Watch",
    slug: "smart-fitness-tracker-watch",
    description: "Advanced fitness tracker with heart rate monitoring, sleep tracking, and 14-day battery life. Water resistant to 50m.",
    price: 899.00,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1546868871-af0de0ae72f9?w=800",
    ],
    category: "Electronics",
    stock: 40,
  },
  {
    name: "Natural Shea Butter Moisturizer",
    slug: "natural-shea-butter-moisturizer",
    description: "Organic shea butter face and body moisturizer. Enriched with vitamin E and essential oils. Suitable for all skin types.",
    price: 199.00,
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800",
    ],
    category: "Beauty",
    stock: 80,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products`);

  // Create admin user
  const adminEmail = "admin@cairocart.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hash("Admin@123", 12);
    await prisma.user.create({
      data: {
        name: "CairoCart Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log(`Created admin user: ${adminEmail} / Admin@123`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
