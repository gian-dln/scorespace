import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          ScoreSpace
        </Link>
        <nav className="text-sm text-zinc-500">
          <a href="https://imslp.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Powered by IMSLP
          </a>
        </nav>
      </div>
    </header>
  );
}
