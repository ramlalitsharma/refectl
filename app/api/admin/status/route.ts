import { NextResponse } from "next/server";
import * as adminCheck from "@/lib/admin-check";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await adminCheck.isAdmin();
    const role = await adminCheck.getUserRole();

    // Check for Pro status in metadata via Clerk if available
    const { auth, clerkClient } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    let isPro = false;
    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      isPro = user.publicMetadata.isPro === true;
    }

    return NextResponse.json({
      isAdmin: admin,
      role: role ?? null,
      isSuperAdmin: role === "superadmin",
      isPro,
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
