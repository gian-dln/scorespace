import type { Work } from "@/types";
import Link from "next/link";

export function WorkDetail({ work }: { work: Work }) {
  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">{work.title}</h1>
        <p className="text-zinc-500">
          <Link href={`/composer/${encodeURIComponent(work.composer.id)}`} className="hover:underline">
            {work.composer.name}
          </Link>
          {work.catalogNumber ? ` · ${work.catalogNumber}` : ""}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {work.yearComposed && (
          <div>
            <dt className="text-zinc-500">Composed</dt>
            <dd>{work.yearComposed}</dd>
          </div>
        )}
        {work.keySignature && (
          <div>
            <dt className="text-zinc-500">Key</dt>
            <dd>{work.keySignature}</dd>
          </div>
        )}
        {work.instrumentation && (
          <div>
            <dt className="text-zinc-500">Instrumentation</dt>
            <dd>{work.instrumentation}</dd>
          </div>
        )}
      </dl>

      {work.description && <p className="text-sm leading-relaxed">{work.description}</p>}

      <section>
        <h2 className="mb-2 text-lg font-medium">Scores</h2>
        {work.scores.length === 0 ? (
          <p className="text-sm text-zinc-500">No scores found for this work yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {work.scores.map((score) => (
              <li key={score.id}>
                <a
                  href={score.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground underline underline-offset-2 hover:opacity-80"
                >
                  {score.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <a
        href={work.imslpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-zinc-500 hover:underline"
      >
        View on IMSLP →
      </a>
    </article>
  );
}
