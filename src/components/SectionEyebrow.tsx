import { cn } from "@/lib/utils";

export function SectionEyebrow({
  label,
  title,
  subtitle,
  align = "center",
  dark = false,
  className,
}: {
  label: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      <span
        className={cn(
          "mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest",
          dark
            ? "border-nm-teal/40 bg-nm-teal/10 text-nm-teal-ink"
            : "border-nm-teal/30 bg-nm-light text-nm-teal-ink",
        )}
      >
        {label}
      </span>
      <h2
        className={cn(
          "font-display text-3xl font-bold sm:text-4xl lg:text-5xl",
          dark ? "text-white" : "text-nm-navy",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-white/65" : "text-nm-muted")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
