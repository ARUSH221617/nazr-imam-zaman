import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const requireAdminCookies = async (): Promise<NextResponse | null> => {
  const cookieStore = await cookies();
  const authToken =
    cookieStore.get("auth-token")?.value ?? cookieStore.get("session")?.value;
  const role =
    cookieStore.get("role")?.value ?? cookieStore.get("user-role")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return null;
};

