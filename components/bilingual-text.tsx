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
      <div className={cn("flex w-full min-w-0 flex-col text-left", className)}>
        <div>{czech}</div>
        <div className={cn("opacity-80", secondaryClassName)}>{english}</div>
      </div>
    );
  }

  return <div className={className}>{czech || english || single}</div>;
}
