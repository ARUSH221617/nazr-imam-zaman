import { randomBytes, scryptSync } from "node:crypto";

import { db } from "../src/lib/db";

const createPasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
};

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

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminName = process.env.ADMIN_NAME ?? "Administrator";
  const existingAdmin = await db.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });
  const adminPassword =
    process.env.ADMIN_PASSWORD ?? randomBytes(24).toString("base64url");
  const passwordHash = existingAdmin
    ? null
    : createPasswordHash(adminPassword);

  await db.user.upsert({
    where: { email: adminEmail },
    update: {
      isAdmin: true,
      name: adminName,
    },
    create: {
      email: adminEmail,
      name: adminName,
      isAdmin: true,
      passwordHash: passwordHash ?? createPasswordHash(adminPassword),
    },
  });

  if (!existingAdmin) {
    console.log("Admin account created.");
    console.log(`Admin email: ${adminEmail}`);
    console.log(`Admin password: ${adminPassword}`);
    console.log("Store these credentials securely and rotate after first use.");
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
