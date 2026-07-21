export function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline">
      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-6 py-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel">ScoreSpace — Public Domain</p>
        <p className="max-w-xl text-sm text-steel/90">
          Not affiliated with IMSLP. Scores are sourced from the public domain and IMSLP&apos;s Creative
          Commons-licensed catalogue.
        </p>
      </div>
    </footer>
  );
}
