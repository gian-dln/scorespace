import { WorkDetail } from "@/components/work/WorkDetail";
import { getWork } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await getWork(decodeURIComponent(id));

  if (!work) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <WorkDetail work={work} />
    </div>
  );
}
