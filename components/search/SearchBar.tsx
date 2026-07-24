"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="group relative flex items-center gap-3 border-b border-hairline pb-3 focus-within:border-transparent"
    >
      {/* lift panel: a soft raised surface that rises behind the field on
          focus, so the bar reads as coming forward off the (blurred) page */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-5 -inset-y-4 -z-10 rounded-2xl bg-surface opacity-0 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] ring-1 ring-hairline transition duration-300 ease-out group-focus-within:opacity-100"
      />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a work, composer, or catalogue number…"
        aria-label="Search the IMSLP catalogue"
        className="min-w-0 flex-1 bg-transparent text-lg text-ink placeholder:text-steel/80 focus:outline-none"
      />
      {/* barline: a musical divider that also separates field from action */}
      <span aria-hidden className="h-5 w-px bg-hairline" />
      <button
        type="submit"
        className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:text-steel"
      >
        Search
      </button>
      {/* chrome highlight: pops in from the centre when focused, out on blur */}
      <span
        aria-hidden
        className="chrome-h pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-center scale-x-0 rounded-full opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-within:scale-x-100 group-focus-within:opacity-100"
      />
    </form>
  );
}
