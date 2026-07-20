import { getComposer } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ComposerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const composer = await getComposer(decodeURIComponent(slug));

  if (!composer) notFound();

  const lifespan = [composer.birthYear, composer.deathYear].filter(Boolean).join("–");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">{composer.name}</h1>
        <p className="text-zinc-500">
          {[lifespan, composer.nationality].filter(Boolean).join(" · ")}
        </p>
      </header>

      <Link
        href={`/search?q=${encodeURIComponent(composer.name)}`}
        className="text-sm text-foreground underline underline-offset-2 hover:opacity-80 w-fit"
      >
        Browse works by {composer.name} →
      </Link>

      <a
        href={composer.imslpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-zinc-500 hover:underline w-fit"
      >
        View on IMSLP →
      </a>
    </div>
  );
}
