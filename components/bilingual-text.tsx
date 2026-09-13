import { cn } from "@/lib/utils";

type BilingualTextProps = {
  cs?: string;
  en?: string;
  fallback?: string;
  className?: string;
  secondaryClassName?: string;
};

export function BilingualText({
  cs,
  en,
  fallback,
  className,
  secondaryClassName,
}: BilingualTextProps) {
  const czech = cs?.trim() ?? "";
  const english = en?.trim() ?? "";
  const single = fallback?.trim() ?? "";
  const both =
    Boolean(czech && english) &&
    czech.localeCompare(english, undefined, { sensitivity: "accent" }) !== 0;

  if (both) {
    return (
      <span className={cn("flex min-w-0 flex-col text-left", className)}>
        <span>{czech}</span>
        <span className={cn("opacity-80", secondaryClassName)}>{english}</span>
      </span>
    );
  }

  return <span className={className}>{czech || english || single}</span>;
}
