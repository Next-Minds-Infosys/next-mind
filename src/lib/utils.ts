import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Rupee formatter shared by server components and client components. It lives
 * here rather than next to the billing UI on purpose: a plain function exported
 * from a "use client" module becomes a client reference on the server, and
 * calling it during a server render throws "Attempted to call npr() from the
 * server but npr is on the client".
 */
export const npr = (n: number) => `NPR ${n.toLocaleString("en-NP")}`;
