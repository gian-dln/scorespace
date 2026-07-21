import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          ScoreSpace
        </Link>
        <a
          href="https://imslp.org"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel hover:text-ink"
        >
          Powered by IMSLP
        </a>
      </div>
    </header>
  );
}
