import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-hairline bg-keywhite p-5",
        "transition-colors hover:border-ink/70",
        className,
      )}
      {...props}
    />
  );
}
