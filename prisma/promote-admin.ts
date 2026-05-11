import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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

const email = process.argv[2]?.toLowerCase().trim();

async function main() {
  if (!email) {
    console.error("Usage: npx tsx prisma/promote-admin.ts <email>");
    console.error("Example: npx tsx prisma/promote-admin.ts user@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`User ${email} is already an admin.`);
    await prisma.$disconnect();
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`Promoted ${email} to ADMIN.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
