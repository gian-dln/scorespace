import { MusicalGrowth } from "@/components/home/MusicalGrowth";
import { SearchBar } from "@/components/search/SearchBar";

export default function Home() {
  return (
    <div className="group/search mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
      {/* everything but the field recedes and blurs while the field is focused */}
      <div className="transition duration-300 ease-out group-focus-within/search:scale-[0.98] group-focus-within/search:opacity-40 group-focus-within/search:blur-[5px] motion-reduce:group-focus-within/search:scale-100">
        <MusicalGrowth />
      </div>

      <div className="flex flex-col items-center gap-3 transition duration-300 ease-out group-focus-within/search:scale-[0.98] group-focus-within/search:opacity-40 group-focus-within/search:blur-[5px] motion-reduce:group-focus-within/search:scale-100">
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

      {/* the field rises toward centre and enlarges as it comes forward.
          Gated to sm+ — on phones the keyboard already fills the screen, so the
          reposition/zoom is disabled to avoid a jarring jump. */}
      <div className="relative z-10 w-full max-w-xl will-change-transform transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:group-focus-within/search:-translate-y-[13vh] sm:group-focus-within/search:scale-[1.14] sm:motion-reduce:group-focus-within/search:translate-y-0 sm:motion-reduce:group-focus-within/search:scale-100">
        <SearchBar />
      </div>
    </div>
  );
}
