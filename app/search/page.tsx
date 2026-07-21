import { Suspense } from "react";
import { ScoreFlourish } from "@/components/search/ScoreFlourish";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { search } from "@/lib/supabase/queries";

/** The awaiting half of the page. Keeping it in its own component lets the
 *  headline and search field render instantly while this streams in behind
 *  a Suspense boundary — searches take ~2s, so the wait needs to be visible. */
async function Results({ query }: { query: string }) {
  const results = await search(query);

  return (
    <>
      <div className="mt-8">
        <ScoreFlourish />
      </div>
      <p className="mt-6 font-mono text-xs text-steel">
        {results.works.length} works · {results.composers.length} composers
      </p>
      <div className="mt-10">
        <SearchResults results={results} />
      </div>
    </>
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
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-20">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
          {query ? "Search results" : "Public-domain score library"}
        </span>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {query ? <>&ldquo;{query}&rdquo;</> : "Search the repertoire"}
        </h1>
      </header>

      <div className="mt-8">
        <SearchBar initialQuery={query} />
      </div>

      {query ? (
        <Suspense
          key={query}
          fallback={
            <>
              <div className="mt-8">
                <ScoreFlourish busy />
              </div>
              <p className="mt-6 font-mono text-xs text-steel">Searching the catalogue…</p>
            </>
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
  );
}
