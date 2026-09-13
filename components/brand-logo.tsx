import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  width?: number;
  priority?: boolean;
};

export function BrandLogo({
  className,
  width = 480,
  priority = false,
}: BrandLogoProps) {
  const height = Math.round((width * 640) / 1138);
  return (
    <Image
      src="/logo.png"
      alt="5 proti 5"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto max-w-full drop-shadow-[0_12px_30px_rgba(255,78,0,0.45)]", className)}
    />
  );
}
