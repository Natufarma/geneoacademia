import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const store = await cookies();
  store.delete({ name: ADMIN_COOKIE, path: "/" });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
