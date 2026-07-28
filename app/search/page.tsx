import Link from "next/link";
import { Suspense } from "react";
import { ScoreFlourish } from "@/components/search/ScoreFlourish";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { WorksList } from "@/components/search/WorksList";
import { search, searchMoreWorks } from "@/lib/supabase/queries";

/** The awaiting half of the page. Keeping it in its own component lets the
 *  headline and search field render instantly while this streams in behind
 *  a Suspense boundary — searches take ~2s, so the wait needs to be visible. */
async function Results({ query }: { query: string }) {
  const results = await search(query);

  return (
    // Once results are ready the whole block fades and rises in smoothly; no
    // separate loading animation for the flourish.
    <div className="load-in">
      <div className="mt-8">
        <ScoreFlourish />
      </div>
      <p className="mt-6 font-mono text-xs text-steel">
        {results.works.length} works · {results.composers.length} composers
      </p>
      <div className="mt-10">
        <SearchResults results={results} />
      </div>
    </div>
  );
}

/** A composer chip in the results narrows the page to that composer's works.
 *  Every IMSLP work title carries its composer in parentheses, so searching
 *  the name is an effective filter; searchMoreWorks gives the first page plus
 *  the "load more" offset, so WorksList paginates it just like a normal search. */
async function FilteredResults({ composer }: { composer: string }) {
  const { works, nextWorksOffset } = await searchMoreWorks(composer, 0);

  return (
    <div className="load-in">
      <div className="mt-8">
        <ScoreFlourish />
      </div>
      <p className="mt-6 font-mono text-xs text-steel">
        {works.length} works by {composer}
      </p>
      <div className="mt-10">
        {works.length === 0 ? (
          <p className="text-[15px] leading-relaxed text-steel">
            No works found for {composer}.
          </p>
        ) : (
          <section>
            <div className="mb-4 flex items-center gap-4">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">Works</h2>
              <span className="h-px flex-1 bg-hairline" />
            </div>
            <WorksList query={composer} initialWorks={works} initialNextOffset={nextWorksOffset} />
          </section>
        )}
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="group/search mx-auto w-full max-w-4xl px-6 py-16 sm:py-20">
      {/* the headline recedes and blurs while the field is focused */}
      <header className="flex flex-col gap-3 transition duration-300 ease-out group-focus-within/search:scale-[0.99] group-focus-within/search:opacity-40 group-focus-within/search:blur-[5px] motion-reduce:group-focus-within/search:scale-100">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
          {query ? "Search results" : "Public-domain score library"}
        </span>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {query ? <>&ldquo;{query}&rdquo;</> : "Search the repertoire"}
        </h1>
      </header>

      {/* the field enlarges and comes forward (sm+ only; no zoom on phones) */}
      <div className="relative z-10 mt-8 origin-top will-change-transform transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:group-focus-within/search:scale-[1.06] sm:motion-reduce:group-focus-within/search:scale-100">
        <SearchBar initialQuery={query} />
      </div>

      <div className="transition duration-300 ease-out group-focus-within/search:scale-[0.99] group-focus-within/search:opacity-40 group-focus-within/search:blur-[5px] motion-reduce:group-focus-within/search:scale-100">
        {query ? (
          <Suspense
            key={query}
            fallback={
              // Nothing but a quiet text cue while loading — the flourish and
              // results stay hidden until ready, then fade in together.
              <p className="mt-14 font-mono text-xs text-steel">Searching the catalogue…</p>
            }
          >
            <Results query={query} />
          </Suspense>
        ) : (
          <>
            <div className="mt-8">
              <ScoreFlourish />
            </div>
            <p className="mt-14 max-w-lg text-[15px] leading-relaxed text-steel">
              Search by work, composer, or catalogue number — try{" "}
              <span className="font-mono text-ink">BWV 1007</span> or{" "}
              <span className="whitespace-nowrap font-display italic text-ink">Clair de lune</span>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
