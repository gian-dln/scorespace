import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { search } from "@/lib/supabase/queries";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const results = query ? await search(query) : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-20">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
          {results ? "Search results" : "Public-domain score library"}
        </span>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
          {results ? <>&ldquo;{results.query}&rdquo;</> : "Search the repertoire"}
        </h1>
        {results && (
          <p className="font-mono text-xs text-steel">
            {results.works.length} works · {results.composers.length} composers
          </p>
        )}
      </header>

      <div className="mt-8">
        <SearchBar initialQuery={query} />
      </div>

      {/* Signature: the keyboard you play to find music. */}
      <div className="mt-8 overflow-hidden rounded-[3px] ring-1 ring-hairline">
        <div className="piano-keys" aria-hidden="true" />
      </div>

      <div className="mt-14">
        {results ? (
          <SearchResults results={results} />
        ) : (
          <p className="max-w-lg text-[15px] leading-relaxed text-steel">
            Search by work, composer, or catalogue number — try{" "}
            <span className="font-mono text-ink">BWV 1007</span> or{" "}
            <span className="font-display italic text-ink">Clair de lune</span>.
          </p>
        )}
      </div>
    </div>
  );
}
