import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Runs before routes render: refreshes the Supabase session and
 * protects /boards/* for signed-in users only.
 *
 * NOTE: In Next.js 16 the `middleware.ts` convention was renamed to
 * `proxy.ts` (the old name still works but is deprecated).
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/boards/:path*", "/login"],
};
