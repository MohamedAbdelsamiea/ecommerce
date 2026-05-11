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

/**
 * Backfill strategy:
 * 1. Check if the "orderNumber" column exists in the DB
 * 2. If the column does NOT exist, run prisma db push first via the Prisma schema
 * 3. Find rows where the column IS NULL (before Prisma's NOT NULL constraint was applied)
 * 4. Assign unique sequential order numbers preserving creation order
 * 5. Verify no NULLs remain
 */
async function main() {
  console.log("Step 1: Checking if orderNumber column exists...");

  // Use information_schema to find the actual column name (handles case variations)
  const columns: { column_name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name ILIKE '%order%number%'`
  );

  if (columns.length === 0) {
    console.log("orderNumber column not found in the database.");
    console.log("Run 'npx prisma db push' first to add the column, then re-run this script.");
    console.log("Full command: npm run db:push && npm run db:backfill-order-numbers");
    await prisma.$disconnect();
    return;
  }

  const colName = columns[0].column_name;
  console.log(`Found column: "${colName}"`);

  // Use quoted identifier for case-sensitive column names
  const quotedCol = `"${colName}"`;

  console.log("Step 2: Finding orders with null orderNumber...");

  const nullOrders: { id: string; createdAt: string }[] = await prisma.$queryRawUnsafe(
    `SELECT id, "createdAt" FROM orders WHERE ${quotedCol} IS NULL ORDER BY "createdAt" ASC`
  );

  if (nullOrders.length === 0) {
    console.log("All orders have valid order numbers. Nothing to backfill.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Step 3: Found ${nullOrders.length} orders with null orderNumber.`);

  // Find the current maximum orderNumber (handles the case where some rows already have values)
  const maxResult: { max: number | null }[] = await prisma.$queryRawUnsafe(
    `SELECT MAX(${quotedCol}) FROM orders`
  );
  let nextNumber = (maxResult[0]?.max ?? 0) + 1;

  console.log(`Starting order numbers from: ${nextNumber}`);
  console.log("Step 4: Assigning order numbers...");

  for (const order of nullOrders) {
    await prisma.$executeRawUnsafe(
      `UPDATE orders SET ${quotedCol} = $1 WHERE id = $2`,
      nextNumber,
      order.id
    );
    const date = order.createdAt?.toString().split("T")[0] ?? "unknown";
    console.log(`  ${order.id.slice(0, 8)}… (${date}) → ORD-${nextNumber}`);
    nextNumber++;
  }

  console.log("Step 5: Verifying no NULLs remain...");
  const remaining: { count: bigint }[] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) FROM orders WHERE ${quotedCol} IS NULL`
  );
  const remainingCount = Number(remaining[0]?.count ?? 0);

  if (remainingCount > 0) {
    console.error(`WARNING: ${remainingCount} orders still have null orderNumber!`);
  } else {
    console.log(`Done. Assigned ${nullOrders.length} order numbers successfully.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
