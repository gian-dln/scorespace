import { NextResponse } from "next/server";
import { getWork } from "@/lib/supabase/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await getWork(decodeURIComponent(id));

  if (!work) {
    return NextResponse.json({ error: "Work not found" }, { status: 404 });
  }

  return NextResponse.json(work);
}
