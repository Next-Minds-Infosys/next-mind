import * as React from "react";
import { cn } from "@/lib/utils";

const BentoGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4", className)}
      {...props}
    />
  ),
);
BentoGrid.displayName = "BentoGrid";

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
}

const colSpanClass: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
};

const rowSpanClass: Record<number, string> = {
  1: "lg:row-span-1",
  2: "lg:row-span-2",
};

function BentoCard({ className, colSpan = 1, rowSpan = 1, ...props }: BentoCardProps) {
  return (
    <div
      className={cn(
        "col-span-1",
        colSpanClass[colSpan],
        rowSpanClass[rowSpan],
        className,
      )}
      {...props}
    />
  );
}

export { BentoGrid, BentoCard };
