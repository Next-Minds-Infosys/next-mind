import { randomBytes } from "crypto";

/** cuid-like id compatible with existing Prisma rows */
export function createId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `c${timestamp}${random}`;
}
