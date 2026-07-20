import { Card } from "@/components/ui/Card";
import type { Work } from "@/types";
import Link from "next/link";

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/work/${encodeURIComponent(work.id)}`}>
      <Card>
        <h3 className="font-medium">{work.title}</h3>
        <p className="text-sm text-zinc-500">
          {work.composer.name}
          {work.catalogNumber ? ` · ${work.catalogNumber}` : ""}
        </p>
      </Card>
    </Link>
  );
}
