"use client";

import { usePathname } from "next/navigation";

/**
 * Replays the page-enter animation whenever the route changes.
 *
 * Keyed on `usePathname()` rather than using `template.tsx` on purpose: a
 * template remounts on *any* navigation, including a new `?q=` on the search
 * page. That would re-animate the heading and search field on every search,
 * undoing the Suspense work that deliberately keeps them still while results
 * stream. Pathname changes only, so searching stays put and moving between
 * pages animates.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
