import * as React from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  children,
  className,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("group/marquee overflow-hidden", className)}>
      <div
        className={cn(
          "animate-marquee flex w-max items-center gap-10",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        )}
      >
        <div className="flex items-center gap-10">{children}</div>
        <div className="flex items-center gap-10" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
