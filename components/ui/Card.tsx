import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-black/10 dark:border-white/15 p-4",
        "hover:border-black/20 dark:hover:border-white/25 transition-colors",
        className,
      )}
      {...props}
    />
  );
}
