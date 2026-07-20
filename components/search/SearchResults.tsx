import type { SearchResult } from "@/types";
import Link from "next/link";
import { WorkCard } from "@/components/work/WorkCard";

export function SearchResults({ results }: { results: SearchResult }) {
  if (results.total === 0) {
    return <p className="text-sm text-zinc-500">No results for “{results.query}”.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {results.composers.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">Composers</h2>
          <ul className="flex flex-wrap gap-2">
            {results.composers.map((composer) => (
              <li key={composer.id}>
                <Link
                  href={`/composer/${encodeURIComponent(composer.id)}`}
                  className="rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                >
                  {composer.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.works.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">Works</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
