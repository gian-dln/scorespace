import { Card } from "@/components/ui/Card";
import type { Work } from "@/types";
import Link from "next/link";

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/work/${encodeURIComponent(work.id)}`} className="press group block">
      <Card className="relative h-full overflow-hidden">
        {/* chrome edge lights up on hover */}
        <span
          aria-hidden
          className="chrome-v pointer-events-none absolute inset-y-0 left-0 w-[3px] opacity-0 group-hover:opacity-100"
        />
        {work.catalogNumber && (
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">{work.catalogNumber}</p>
        )}
        <h3 className="font-display text-xl leading-snug text-ink">{work.title}</h3>
        <p className="mt-1 text-sm text-steel">{work.composer.name}</p>
      </Card>
    </Link>
  );
}
