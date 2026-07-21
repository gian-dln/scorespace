import { SearchBar } from "@/components/search/SearchBar";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Find public-domain sheet music</h1>
      <p className="max-w-md text-steel">
        ScoreSpace searches IMSLP&apos;s catalog of scores by title, composer, or catalog number.
      </p>
      <SearchBar />
    </div>
  );
}
