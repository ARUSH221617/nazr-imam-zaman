-- Ensure slug exists before enforcing NOT NULL (fresh DBs do not have this column yet).
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Backfill legacy records so NOT NULL can be applied safely.
UPDATE "Post"
SET "slug" = "id"
WHERE "slug" IS NULL OR "slug" = '';

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "slug" SET NOT NULL;
