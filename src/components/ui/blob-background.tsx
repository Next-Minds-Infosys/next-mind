import { cn } from "@/lib/utils";

type BlobVariant = "teal-blue" | "violet-teal" | "dark";

const variantBlobs: Record<BlobVariant, [string, string, string]> = {
  "teal-blue": ["bg-nm-teal/30", "bg-nm-blue/25", "bg-nm-teal/15"],
  "violet-teal": ["bg-violet-500/25", "bg-nm-teal/20", "bg-fuchsia-500/15"],
  dark: ["bg-nm-teal/20", "bg-violet-500/20", "bg-nm-blue/15"],
};

export function BlobBackground({
  variant = "teal-blue",
  noise = true,
  className,
}: {
  variant?: BlobVariant;
  noise?: boolean;
  className?: string;
}) {
  const [a, b, c] = variantBlobs[variant];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div
        className={cn(
          "animate-blob-a absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl",
          a,
        )}
      />
      <div
        className={cn(
          "animate-blob-b absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full blur-3xl",
          b,
        )}
      />
      <div
        className={cn(
          "animate-blob-c absolute -bottom-24 left-1/4 h-[24rem] w-[24rem] rounded-full blur-3xl",
          c,
        )}
      />
      {noise && <div className="nm-noise" />}
    </div>
  );
}
