import { NextResponse } from "next/server";
import { getComposer } from "@/lib/supabase/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const composer = await getComposer(decodeURIComponent(slug));

  if (!composer) {
    return NextResponse.json({ error: "Composer not found" }, { status: 404 });
  }

  return NextResponse.json(composer);
}