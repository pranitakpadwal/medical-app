import { NextResponse } from "next/server";

/**
 * Admin routes are protected by a single shared password (ADMIN_PASSWORD env
 * var) sent as the `x-admin-key` header. Right-sized for a pilot with one or
 * two trusted content curators; replaced by real accounts in Phase 3.
 */
export function checkAdmin(request: Request): NextResponse | null {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return NextResponse.json(
      { error: "Admin is not enabled: set ADMIN_PASSWORD on the deployment." },
      { status: 501 },
    );
  }
  if (request.headers.get("x-admin-key") !== configured) {
    return NextResponse.json({ error: "Wrong admin password." }, { status: 401 });
  }
  return null;
}
