DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BlogPostStatus') THEN
    CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');
  END IF;
END $$;

ALTER TABLE "Post"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "excerpt" TEXT,
  ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'fa',
  ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

UPDATE "Post"
SET "content" = ''
WHERE "content" IS NULL;

ALTER TABLE "Post"
  ALTER COLUMN "content" SET DEFAULT '',
  ALTER COLUMN "content" SET NOT NULL;

UPDATE "Post"
SET "slug" = "id"
WHERE "slug" IS NULL OR "slug" = '';

UPDATE "Post"
SET
  "status" = CASE WHEN "published" = true THEN 'PUBLISHED'::"BlogPostStatus" ELSE 'DRAFT'::"BlogPostStatus" END,
  "publishedAt" = CASE WHEN "published" = true THEN COALESCE("updatedAt", "createdAt") ELSE NULL END
WHERE EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'Post'
    AND column_name = 'published'
);

ALTER TABLE "Post"
  DROP COLUMN IF EXISTS "published";

ALTER TABLE "Post"
  ALTER COLUMN "authorId" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "BlogCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "language" TEXT NOT NULL DEFAULT 'fa',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlogTag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlogPostTag" (
  "postId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId", "tagId")
);

CREATE TABLE IF NOT EXISTS "AdminResetToken" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_language_key" ON "Post"("slug", "language");
CREATE INDEX IF NOT EXISTS "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Post_status_publishAt_idx" ON "Post"("status", "publishAt");
CREATE INDEX IF NOT EXISTS "Post_language_idx" ON "Post"("language");

CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_slug_language_key" ON "BlogCategory"("slug", "language");
CREATE UNIQUE INDEX IF NOT EXISTS "BlogTag_slug_key" ON "BlogTag"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminResetToken_tokenHash_key" ON "AdminResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "AdminResetToken_email_idx" ON "AdminResetToken"("email");
CREATE INDEX IF NOT EXISTS "AdminResetToken_expiresAt_idx" ON "AdminResetToken"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Post_categoryId_fkey') THEN
    ALTER TABLE "Post"
      ADD CONSTRAINT "Post_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Post_authorId_fkey') THEN
    ALTER TABLE "Post"
      ADD CONSTRAINT "Post_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BlogPostTag_postId_fkey') THEN
    ALTER TABLE "BlogPostTag"
      ADD CONSTRAINT "BlogPostTag_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "Post"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BlogPostTag_tagId_fkey') THEN
    ALTER TABLE "BlogPostTag"
      ADD CONSTRAINT "BlogPostTag_tagId_fkey"
      FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

