import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";

import { BlogPostStatus } from "@prisma/client";

import { db } from "../src/lib/db";

const LANGUAGE_FA = "fa";

type AdminId = string | null;

interface SeedCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
}

interface SeedTag {
  id: string;
  slug: string;
  name: string;
}

interface SeedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: BlogPostStatus;
  publishedAt: Date | null;
  publishAt: Date | null;
  categorySlug: string;
  tagSlugs: string[];
}

const seedCategories: SeedCategory[] = [
  {
    id: "seed-category-mahdaviat",
    slug: "mahdaviat",
    name: "معرفت امام زمان",
    description: "یادداشت هایی درباره معرفت، انتظار و وظایف منتظران",
  },
  {
    id: "seed-category-adab-entezar",
    slug: "adab-entezar",
    name: "آداب انتظار",
    description: "مطالبی درباره دعا، عمل صالح و سبک زندگی منتظرانه",
  },
];

const seedTags: SeedTag[] = [
  { id: "seed-tag-dua", slug: "dua", name: "دعا" },
  { id: "seed-tag-salawat", slug: "salawat", name: "صلوات" },
  { id: "seed-tag-entezar", slug: "entezar", name: "انتظار" },
  { id: "seed-tag-mahdaviat", slug: "mahdaviat", name: "مهدویت" },
];

const buildSeededPosts = (): SeedPost[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return [
    {
      id: "seed-post-fazilat-dua-faraj",
      slug: "fazilat-dua-faraj",
      title: "فضیلت دعای فرج در روایات",
      excerpt: "نگاهی کوتاه به آثار معنوی دعای فرج در زندگی روزمره.",
      content:
        "دعای فرج از اعمال مهم منتظران است. در این نوشته، به آثار امیدآفرین آن در آرامش قلبی و انس با امام زمان (عج) می پردازیم.",
      status: BlogPostStatus.PUBLISHED,
      publishedAt: yesterday,
      publishAt: null,
      categorySlug: "mahdaviat",
      tagSlugs: ["dua", "entezar"],
    },
    {
      id: "seed-post-muraqebe-roozane-entezar",
      slug: "muraqebe-roozane-entezar",
      title: "مراقبه روزانه برای منتظران",
      excerpt: "چند تمرین ساده برای تقویت حضور قلب و آمادگی معنوی.",
      content:
        "برنامه روزانه منتظرانه می تواند با یاد امام زمان (عج)، صدقه، دعا و خدمت به مردم تکمیل شود. استمرار در این مسیر مهم ترین اصل است.",
      status: BlogPostStatus.DRAFT,
      publishedAt: null,
      publishAt: null,
      categorySlug: "adab-entezar",
      tagSlugs: ["mahdaviat", "entezar"],
    },
    {
      id: "seed-post-barname-salawat-jamei",
      slug: "barname-salawat-jamei",
      title: "برنامه جمعی صلوات برای تعجیل فرج",
      excerpt: "پیشنهادی برای برگزاری برنامه هفتگی صلوات در خانواده.",
      content:
        "تجربه های جمعی صلوات می تواند روحیه امید و همدلی را افزایش دهد. این برنامه را با نیت تعجیل در فرج و اصلاح نفس دنبال کنید.",
      status: BlogPostStatus.SCHEDULED,
      publishedAt: null,
      publishAt: tomorrow,
      categorySlug: "adab-entezar",
      tagSlugs: ["salawat", "dua"],
    },
  ];
};

const createPasswordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
};

const hasTable = async (tableName: string): Promise<boolean> => {
  const result = await db.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS "exists"
    `,
    tableName,
  );

  return result[0]?.exists ?? false;
};

const seedPostTags = async (postId: string, tagSlugs: string[], tagIdBySlug: Record<string, string>) => {
  await db.blogPostTag.deleteMany({
    where: { postId },
  });

  const tagRows = tagSlugs
    .map((slug) => tagIdBySlug[slug])
    .filter((tagId): tagId is string => Boolean(tagId))
    .map((tagId) => ({ postId, tagId }));

  if (tagRows.length > 0) {
    await db.blogPostTag.createMany({
      data: tagRows,
      skipDuplicates: true,
    });
  }
};

const seedNormalizedBlogData = async (adminId: AdminId) => {
  for (const category of seedCategories) {
    await db.blogCategory.upsert({
      where: { id: category.id },
      update: {},
      create: { id: category.id },
    });

    await db.blogCategoryTranslation.upsert({
      where: {
        categoryId_language: {
          categoryId: category.id,
          language: LANGUAGE_FA,
        },
      },
      update: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      create: {
        categoryId: category.id,
        language: LANGUAGE_FA,
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
  }

  for (const tag of seedTags) {
    await db.blogTag.upsert({
      where: { id: tag.id },
      update: {},
      create: { id: tag.id },
    });

    await db.blogTagTranslation.upsert({
      where: {
        tagId_language: {
          tagId: tag.id,
          language: LANGUAGE_FA,
        },
      },
      update: {
        name: tag.name,
        slug: tag.slug,
      },
      create: {
        tagId: tag.id,
        language: LANGUAGE_FA,
        name: tag.name,
        slug: tag.slug,
      },
    });
  }

  const categoryIdBySlug: Record<string, string> = Object.fromEntries(
    seedCategories.map((category) => [category.slug, category.id]),
  );
  const tagIdBySlug: Record<string, string> = Object.fromEntries(
    seedTags.map((tag) => [tag.slug, tag.id]),
  );

  for (const post of buildSeededPosts()) {
    await db.blogPost.upsert({
      where: { id: post.id },
      update: {
        status: post.status,
        publishedAt: post.publishedAt,
        publishAt: post.publishAt,
        categoryId: categoryIdBySlug[post.categorySlug] ?? null,
        authorId: adminId,
      },
      create: {
        id: post.id,
        status: post.status,
        publishedAt: post.publishedAt,
        publishAt: post.publishAt,
        categoryId: categoryIdBySlug[post.categorySlug] ?? null,
        authorId: adminId,
      },
    });

    await db.blogPostTranslation.upsert({
      where: {
        postId_language: {
          postId: post.id,
          language: LANGUAGE_FA,
        },
      },
      update: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
      },
      create: {
        postId: post.id,
        language: LANGUAGE_FA,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
      },
    });

    await seedPostTags(post.id, post.tagSlugs, tagIdBySlug);
  }
};

const seedLegacyBlogData = async (adminId: AdminId) => {
  const categoryIdBySlug: Record<string, string> = {};

  for (const category of seedCategories) {
    const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `
        INSERT INTO "BlogCategory" ("id", "name", "slug", "description", "language", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT ("slug", "language")
        DO UPDATE SET
          "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "updatedAt" = NOW()
        RETURNING "id"
      `,
      category.id,
      category.name,
      category.slug,
      category.description,
      LANGUAGE_FA,
    );

    categoryIdBySlug[category.slug] = rows[0]?.id ?? category.id;
  }

  const tagIdBySlug: Record<string, string> = {};

  for (const tag of seedTags) {
    const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `
        INSERT INTO "BlogTag" ("id", "name", "slug", "updatedAt")
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT ("slug")
        DO UPDATE SET
          "name" = EXCLUDED."name",
          "updatedAt" = NOW()
        RETURNING "id"
      `,
      tag.id,
      tag.name,
      tag.slug,
    );

    tagIdBySlug[tag.slug] = rows[0]?.id ?? tag.id;
  }

  for (const post of buildSeededPosts()) {
    const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `
        INSERT INTO "Post" (
          "id", "title", "slug", "excerpt", "content", "status", "language",
          "publishedAt", "publishAt", "categoryId", "authorId", "updatedAt"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6::"BlogPostStatus", $7,
          $8, $9, $10, $11, NOW()
        )
        ON CONFLICT ("slug", "language")
        DO UPDATE SET
          "title" = EXCLUDED."title",
          "excerpt" = EXCLUDED."excerpt",
          "content" = EXCLUDED."content",
          "status" = EXCLUDED."status",
          "publishedAt" = EXCLUDED."publishedAt",
          "publishAt" = EXCLUDED."publishAt",
          "categoryId" = EXCLUDED."categoryId",
          "authorId" = EXCLUDED."authorId",
          "updatedAt" = NOW()
        RETURNING "id"
      `,
      post.id,
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.status,
      LANGUAGE_FA,
      post.publishedAt,
      post.publishAt,
      categoryIdBySlug[post.categorySlug] ?? null,
      adminId,
    );

    const postId = rows[0]?.id ?? post.id;
    await seedPostTags(postId, post.tagSlugs, tagIdBySlug);
  }
};

async function main() {
  const counters = [
    { name: "salawat", count: 170 },
    { name: "dua_faraj", count: 10 },
    { name: "dua_khasa", count: 5 },
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

  const hasTranslationSchema = await hasTable("BlogPostTranslation");

  if (hasTranslationSchema) {
    await seedNormalizedBlogData(admin?.id ?? null);
  } else {
    await seedLegacyBlogData(admin?.id ?? null);
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
