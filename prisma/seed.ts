import { db } from "../src/lib/db";

async function main() {
  // Create or update counters
  const counters = [
    { name: "salawat", count: 0 },
    { name: "dua_faraj", count: 0 },
    { name: "dua_khasa", count: 0 },
  ];

  for (const counter of counters) {
    await db.counter.upsert({
      where: { name: counter.name },
      update: { count: counter.count },
      create: counter,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
