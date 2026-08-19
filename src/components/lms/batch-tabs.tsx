"use client";

import { useState } from "react";

export interface BatchTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Tabbed batch content.
 *
 * The batch pages used to stack every section vertically, so an instructor had
 * to scroll past four forms to reach the roster and a student scrolled past
 * empty panels to find an assignment. Tabs put each area one click away and
 * keep the stats visible above them.
 *
 * The panels are rendered on the server and handed over as `content`; this
 * component only owns which one is visible. Inactive panels stay mounted but
 * hidden so switching tabs never re-runs a query or drops form state.
 */
export function BatchTabs({ tabs }: { tabs: BatchTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-7 overflow-x-auto border-b border-nm-border"
      >
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
                on
                  ? "border-teal-500 font-semibold text-nm-navy"
                  : "border-transparent font-medium text-nm-muted hover:text-nm-navy"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          hidden={t.id !== active}
          className="pt-6"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
