import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { requireAdminCookies } from "@/lib/auth/admin";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const authError = await requireAdminCookies();
  if (authError) {
    return authError;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing_file" }, { status: 400 });
    }

    if (!SUPPORTED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] ?? "bin";
    const pathname = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(pathname, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}

