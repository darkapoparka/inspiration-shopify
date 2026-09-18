import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/neon";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    product: "DealerDesk CRM",
    persistence: isDatabaseConfigured() ? "neon" : "browser"
  });
}
