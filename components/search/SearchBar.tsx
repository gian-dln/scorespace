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
      {/* chrome underline appears on focus — colour arrives when you play */}
      <span
        aria-hidden
        className="chrome-h pointer-events-none absolute inset-x-0 -bottom-px h-px opacity-0 group-focus-within:opacity-100"
      />
    </form>
  );
}
