import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 text-sm",
        "placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-foreground/30",
        className,
      )}
      {...props}
    />
  );
}
