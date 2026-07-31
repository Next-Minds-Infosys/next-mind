import { redirect } from "next/navigation";
import { requireUser, landingFor } from "@/lib/access";
import type { Role } from "@/lib/types";

// Session-dependent: never prerender.
export const dynamic = "force-dynamic";

/**
 * Role router. `proxy.ts` cannot read roles on the edge, so it sends
 * authenticated users here and this resolves the right dashboard server-side.
 */
export default async function AccountPage() {
  const session = await requireUser();
  redirect(landingFor(session.user.role as Role));
}
