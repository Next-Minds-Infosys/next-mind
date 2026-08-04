"use client";

import { useEffect } from "react";

/**
 * Executes the admin-pasted snippet from /admin/custom-code (public site
 * only - see SiteLayout.tsx).
 *
 * `<script>` elements set via `dangerouslySetInnerHTML`/`innerHTML` are
 * inert - the browser parses them but deliberately never runs them, exactly
 * as it would refuse a script written by page content itself. The only way
 * to actually execute a pasted snippet (external `src=` or inline body) is to
 * parse it into real DOM nodes and rebuild each `<script>` via
 * `createElement`, which the browser *does* execute once appended.
 */
export function CustomCodeInjector({ script }: { script: string }) {
  useEffect(() => {
    if (!script.trim()) return;

    const container = document.createElement("div");
    container.innerHTML = script;
    const appended: ChildNode[] = [];

    for (const node of Array.from(container.childNodes)) {
      if (node.nodeName === "SCRIPT") {
        const original = node as HTMLScriptElement;
        const clone = document.createElement("script");
        for (const attr of Array.from(original.attributes)) {
          clone.setAttribute(attr.name, attr.value);
        }
        clone.textContent = original.textContent;
        document.body.appendChild(clone);
        appended.push(clone);
      } else {
        document.body.appendChild(node);
        appended.push(node);
      }
    }

    return () => {
      for (const node of appended) node.parentNode?.removeChild(node);
    };
  }, [script]);

  return null;
}
