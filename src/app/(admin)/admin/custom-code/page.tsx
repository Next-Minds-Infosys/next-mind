import { SiteSetting } from "@/db";
import { SITE_SETTING_ID } from "@/db/models/site-setting";
import { requireResource } from "@/lib/access";
import { RESOURCES } from "@/lib/policies";
import { CustomCodeForm } from "./custom-code-form";

export default async function CustomCodePage() {
  await requireResource(RESOURCES.CUSTOM_CODE);

  const setting = await SiteSetting.findByPk(SITE_SETTING_ID);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Custom Code</h1>
        <p className="mt-1 text-sm text-gray-500">
          A script snippet and CSS rules injected into every page of the public site (not the
          admin/instructor/student dashboards). Use it for tracking pixels, chat widgets, or
          small style tweaks — same idea as the Google Tag Manager snippet already in the site,
          just editable here instead of in code.
        </p>
      </div>

      <CustomCodeForm
        customScript={setting?.customScript ?? ""}
        customCss={setting?.customCss ?? ""}
      />
    </div>
  );
}
