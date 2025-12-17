import { NextResponse } from "next/server";
import { isAdmin, getUserRole } from "@/lib/admin-check";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await isAdmin();
    const role = await getUserRole();
    return NextResponse.json({
      isAdmin: admin,
      role: role ?? null,
      isSuperAdmin: role === "superadmin",
    });
  } catch (err) {
    // Return a consistent shape so clients can rely on fields existing
    console.error("Admin status error:", err);
    return NextResponse.json({
      isAdmin: false,
      role: null,
      isSuperAdmin: false,
    });
  }
}
