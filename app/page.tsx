import { MusicalGrowth } from "@/components/home/MusicalGrowth";
import { SearchBar } from "@/components/search/SearchBar";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
      <MusicalGrowth />

      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
          Public-domain score library
        </span>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Find your score
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-steel">
          Half a million public-domain scores from IMSLP — search by work, composer, or catalogue number.
        </p>
      </div>

      <div className="w-full max-w-xl">
        <SearchBar />
      </div>
    </div>
  );
}
