import { NextResponse } from "next/server";
import { search, searchMoreWorks } from "@/lib/supabase/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  // `offset` requests the next page of works only (the "load more" button).
  const offset = Number(searchParams.get("offset"));
  if (Number.isInteger(offset) && offset > 0) {
    return NextResponse.json(await searchMoreWorks(query, offset));
  }

  return NextResponse.json(await search(query));
}
