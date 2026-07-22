import type { SearchResult } from "@/types";
import Link from "next/link";
import { WorkCard } from "@/components/work/WorkCard";

export function SearchResults({ results }: { results: SearchResult }) {
  if (results.total === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-steel">
        No matches for &ldquo;{results.query}&rdquo;. Try a different spelling, or a catalogue number like{" "}
        <span className="font-mono text-ink">Op.27</span>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {results.composers.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">Composers</h2>
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <ul className="flex flex-wrap gap-2">
            {results.composers.map((composer) => (
              <li key={composer.id}>
                <Link
                  href={`/composer/${encodeURIComponent(composer.id)}`}
                  className="press inline-flex rounded-full border border-hairline px-3.5 py-1.5 text-sm text-ink hover:border-ink hover:bg-ink hover:text-paper"
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
          <div className="mb-4 flex items-center gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">Works</h2>
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
