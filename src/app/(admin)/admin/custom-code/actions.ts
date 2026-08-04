"use server";

import { revalidatePath } from "next/cache";
import { SiteSetting } from "@/db";
import { SITE_SETTING_ID } from "@/db/models/site-setting";
import { parseInput, siteSettingSchema } from "@/lib/schemas";
import { RESOURCES } from "@/lib/policies";
import { sessionCan } from "@/lib/access";

export async function updateSiteSetting(
  data: unknown,
): Promise<{ success: true } | { error: string }> {
  const { allowed } = await sessionCan(RESOURCES.CUSTOM_CODE, "update");
  if (!allowed) return { error: "Unauthorized" };

  const parsed = parseInput(siteSettingSchema, data);
  if (!parsed.success) return { error: parsed.error };

  await SiteSetting.upsert({
    id: SITE_SETTING_ID,
    customScript: parsed.data.customScript || null,
    customCss: parsed.data.customCss || null,
  });

  revalidatePath("/admin/custom-code");
  // Every public page reads this via SiteLayout - without this a save here
  // would sit invisible until each page's own cache happened to expire.
  revalidatePath("/", "layout");
  return { success: true };
}
