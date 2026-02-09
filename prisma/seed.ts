import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";

import { BlogPostStatus } from "@prisma/client";

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

  const admin = await db.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });

  const categories = await Promise.all([
    db.blogCategory.upsert({
      where: {
        slug_language: {
          slug: "mahdaviat",
          language: "fa",
        },
      },
      update: {
        name: "معرفت امام زمان",
        description: "یادداشت هایی درباره معرفت، انتظار و وظایف منتظران",
      },
      create: {
        name: "معرفت امام زمان",
        slug: "mahdaviat",
        language: "fa",
        description: "یادداشت هایی درباره معرفت، انتظار و وظایف منتظران",
      },
    }),
    db.blogCategory.upsert({
      where: {
        slug_language: {
          slug: "adab-entezar",
          language: "fa",
        },
      },
      update: {
        name: "آداب انتظار",
        description: "مطالبی درباره دعا، عمل صالح و سبک زندگی منتظرانه",
      },
      create: {
        name: "آداب انتظار",
        slug: "adab-entezar",
        language: "fa",
        description: "مطالبی درباره دعا، عمل صالح و سبک زندگی منتظرانه",
      },
    }),
  ]);

  const tags = await Promise.all([
    db.blogTag.upsert({
      where: { slug: "dua" },
      update: { name: "دعا" },
      create: { name: "دعا", slug: "dua" },
    }),
    db.blogTag.upsert({
      where: { slug: "salawat" },
      update: { name: "صلوات" },
      create: { name: "صلوات", slug: "salawat" },
    }),
    db.blogTag.upsert({
      where: { slug: "entezar" },
      update: { name: "انتظار" },
      create: { name: "انتظار", slug: "entezar" },
    }),
    db.blogTag.upsert({
      where: { slug: "mahdaviat" },
      update: { name: "مهدویت" },
      create: { name: "مهدویت", slug: "mahdaviat" },
    }),
  ]);

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const seededPosts = [
    {
      slug: "fazilat-dua-faraj",
      title: "فضیلت دعای فرج در روایات",
      excerpt: "نگاهی کوتاه به آثار معنوی دعای فرج در زندگی روزمره.",
      content:
        "دعای فرج از اعمال مهم منتظران است. در این نوشته، به آثار امیدآفرین آن در آرامش قلبی و انس با امام زمان (عج) می پردازیم.",
      status: BlogPostStatus.PUBLISHED,
      publishedAt: yesterday,
      publishAt: null,
      categoryId: categories[0].id,
      tagSlugs: ["dua", "entezar"],
    },
    {
      slug: "muraqebe-roozane-entezar",
      title: "مراقبه روزانه برای منتظران",
      excerpt: "چند تمرین ساده برای تقویت حضور قلب و آمادگی معنوی.",
      content:
        "برنامه روزانه منتظرانه می تواند با یاد امام زمان (عج)، صدقه، دعا و خدمت به مردم تکمیل شود. استمرار در این مسیر مهم ترین اصل است.",
      status: BlogPostStatus.DRAFT,
      publishedAt: null,
      publishAt: null,
      categoryId: categories[1].id,
      tagSlugs: ["mahdaviat", "entezar"],
    },
    {
      slug: "barname-salawat-jamei",
      title: "برنامه جمعی صلوات برای تعجیل فرج",
      excerpt: "پیشنهادی برای برگزاری برنامه هفتگی صلوات در خانواده.",
      content:
        "تجربه های جمعی صلوات می تواند روحیه امید و همدلی را افزایش دهد. این برنامه را با نیت تعجیل در فرج و اصلاح نفس دنبال کنید.",
      status: BlogPostStatus.SCHEDULED,
      publishedAt: null,
      publishAt: tomorrow,
      categoryId: categories[1].id,
      tagSlugs: ["salawat", "dua"],
    },
  ];

  for (const post of seededPosts) {
    const upsertedPost = await db.blogPost.upsert({
      where: {
        slug_language: {
          slug: post.slug,
          language: "fa",
        },
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        publishedAt: post.publishedAt,
        publishAt: post.publishAt,
        categoryId: post.categoryId,
        authorId: admin?.id ?? null,
      },
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        language: "fa",
        publishedAt: post.publishedAt,
        publishAt: post.publishAt,
        categoryId: post.categoryId,
        authorId: admin?.id ?? null,
      },
      select: {
        id: true,
      },
    });

    await db.blogPostTag.deleteMany({
      where: {
        postId: upsertedPost.id,
      },
    });

    await db.blogPostTag.createMany({
      data: post.tagSlugs
        .map((slug) => tags.find((tag) => tag.slug === slug))
        .filter((tag): tag is (typeof tags)[number] => Boolean(tag))
        .map((tag) => ({
          postId: upsertedPost.id,
          tagId: tag.id,
        })),
      skipDuplicates: true,
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
