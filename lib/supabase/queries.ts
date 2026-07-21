import { getImslpPage, searchImslpComposers, searchImslpWorks } from "@/lib/imslp/client";
import {
  composerFromSearchHit,
  parseComposerFromImslpPage,
  parseWorkFromImslpPage,
  workFromSearchHit,
} from "@/lib/imslp/parser";
import type { Composer, SearchResult, Work } from "@/types";
import { isSupabaseConfigured, supabaseServer } from "./server";

/**
 * Expected Supabase tables:
 *   works(id text primary key, data jsonb, updated_at timestamptz)
 *   composers(id text primary key, data jsonb, updated_at timestamptz)
 * `data` stores the normalized Work/Composer as JSON; `updated_at` drives
 * cache freshness so we know when to re-fetch from IMSLP.
 */
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — scores rarely change

function isFresh(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() < CACHE_TTL_MS;
}

export async function getCachedWork(id: string): Promise<Work | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabaseServer.from("works").select("data").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data?.data as Work) ?? null;
}

/** Best-effort: a failed cache write shouldn't take down a request that already has good data. */
export async function upsertWork(work: Work): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabaseServer
    .from("works")
    .upsert({ id: work.id, data: work, updated_at: work.updatedAt });
  if (error) console.error("Failed to cache work", work.id, error);
}

export async function getCachedComposer(id: string): Promise<Composer | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabaseServer.from("composers").select("data").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data?.data as Composer) ?? null;
}

export async function upsertComposer(composer: Composer): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabaseServer
    .from("composers")
    .upsert({ id: composer.id, data: composer, updated_at: new Date().toISOString() });
  if (error) console.error("Failed to cache composer", composer.id, error);
}

/** Cache-aside read for a single work: serve from Supabase if fresh, else pull from IMSLP and backfill.
 * `id` is the work's exact IMSLP page title, e.g. "Symphony No.1, Op.21 (Beethoven, Ludwig van)". */
export async function getWork(id: string): Promise<Work | null> {
  const cached = await getCachedWork(id);
  // Only serve a cached record that is both fresh AND a full page parse.
  // Incomplete stubs (from an older build that cached search hits) fall
  // through to a live fetch, which overwrites them with a complete record.
  if (cached?.complete && isFresh(cached.updatedAt)) return cached;

  const raw = await getImslpPage(id);
  const work = parseWorkFromImslpPage(raw);
  if (!work) return cached; // fall back to stale cache rather than nothing

  await upsertWork(work);
  return work;
}

/** `id` is the composer's bare name, e.g. "Beethoven, Ludwig van" — their
 * IMSLP page lives at "Category:<name>", so we add that prefix here. */
export async function getComposer(id: string): Promise<Composer | null> {
  const cached = await getCachedComposer(id);
  // Composer bios change rarely, so no TTL — but only serve a full record;
  // incomplete stubs fall through to a live fetch that fills in the bio.
  if (cached?.complete) return cached;

  const raw = await getImslpPage(`Category:${id}`);
  const composer = parseComposerFromImslpPage(raw);
  if (!composer) return null;

  await upsertComposer(composer);
  return composer;
}

/** Search always hits IMSLP live (results are query-specific and cheap to compute).
 * It intentionally does NOT cache results: search hits are lightweight stubs
 * (no scores, no metadata), so caching them would (a) serve empty detail pages
 * on click and (b) clobber any complete record a prior detail visit had cached.
 * The work/composer detail pages own the cache — they store full records. */
export async function search(query: string): Promise<SearchResult> {
  const [workHits, composerHits] = await Promise.all([searchImslpWorks(query), searchImslpComposers(query)]);

  const works = workHits.query.search.map(workFromSearchHit).filter((w): w is Work => w !== null);
  const composers = composerHits.query.search.map(composerFromSearchHit).filter((c): c is Composer => c !== null);

  return { query, works, composers, total: works.length + composers.length };
}
