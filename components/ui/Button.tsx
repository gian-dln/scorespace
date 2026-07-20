import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" && "bg-foreground text-background hover:opacity-90",
        variant === "secondary" &&
          "border border-black/10 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.06]",
        className,
      )}
      {...props}
    />
  );
}
