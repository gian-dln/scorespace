import type { SearchResult } from "@/types";
import Link from "next/link";
import { WorksList } from "@/components/search/WorksList";
import { POPULAR_COMPOSERS } from "@/lib/popular-composers";

function PopularComposerSuggestions() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">Explore a composer</h2>
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <ul className="flex flex-wrap gap-2">
        {POPULAR_COMPOSERS.map((composer) => (
          <li key={composer.id}>
            <Link
              href={`/search?composer=${encodeURIComponent(composer.id)}`}
              className="press inline-flex rounded-full border border-hairline px-3.5 py-1.5 text-sm text-ink hover:border-ink hover:bg-ink hover:text-paper"
            >
              {composer.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SearchResults({ results }: { results: SearchResult }) {
  if (results.total === 0) {
    return (
      <div className="flex flex-col gap-8">
        <p className="text-[15px] leading-relaxed text-steel">
          No matches for &ldquo;{results.query}&rdquo;. Try a different spelling, or a catalogue number like{" "}
          <span className="font-mono text-ink">Op.27</span>.
        </p>
        <PopularComposerSuggestions />
      </div>
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
                  href={`/search?q=${encodeURIComponent(results.query)}&composer=${encodeURIComponent(composer.id)}`}
                  className="press inline-flex rounded-full border border-hairline px-3.5 py-1.5 text-sm text-ink hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {composer.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.composers.length === 0 && <PopularComposerSuggestions />}

      {results.works.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">Works</h2>
            <span className="h-px flex-1 bg-hairline" />
          </div>
          <WorksList
            query={results.query}
            initialWorks={results.works}
            initialNextOffset={results.nextWorksOffset}
          />
        </section>
      )}
    </div>
  );
}
