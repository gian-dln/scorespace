"use client";

import { useState } from "react";
import { WorkCard } from "@/components/work/WorkCard";
import type { MoreWorks, Work } from "@/types";

/** The works grid with a "Load more" button. IMSLP's search caps a page at ~24
 *  and reports no total, so more pages are fetched on demand via /api/search. */
export function WorksList({
  query,
  initialWorks,
  initialNextOffset,
}: {
  query: string;
  initialWorks: Work[];
  initialNextOffset: number | null;
}) {
  const [works, setWorks] = useState(initialWorks);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadMore() {
    if (nextOffset == null || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&offset=${nextOffset}`);
      if (!res.ok) throw new Error(`search failed: ${res.status}`);
      const data: MoreWorks = await res.json();
      setWorks((prev) => {
        const seen = new Set(prev.map((w) => w.id));
        return [...prev, ...data.works.filter((w) => !seen.has(w.id))];
      });
      setNextOffset(data.nextWorksOffset);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>

      {nextOffset != null && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="press rounded-full border border-hairline px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
          {error && <p className="text-xs text-steel">Couldn&apos;t load more — tap to try again.</p>}
        </div>
      )}
    </>
  );
}
