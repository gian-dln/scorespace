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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <SearchBar initialQuery={query} />
      {results ? (
        <SearchResults results={results} />
      ) : (
        <p className="text-sm text-zinc-500">Enter a search term to get started.</p>
      )}
    </div>
  );
}
