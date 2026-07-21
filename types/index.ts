/** Shared domain types, used by both lib/imslp/parser.ts (what we normalize into)
 * and lib/supabase (what we cache). */

export interface Composer {
  id: string; // slug, e.g. "bach-johann-sebastian"
  name: string;
  imslpUrl: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  workCount?: number;
  // True only for records parsed from a full IMSLP page. Search hits produce
  // lightweight stubs (complete: false) with no bio fields — the cache must
  // not serve those to a detail page, so getComposer re-fetches when false.
  complete?: boolean;
}

export interface Score {
  id: string;
  label: string; // e.g. "Full Score", "Piano Score"
  url: string;
  pageCount?: number;
  fileSizeBytes?: number;
}

export interface Work {
  id: string; // IMSLP page id / slug
  title: string;
  composer: Pick<Composer, "id" | "name">;
  imslpUrl: string;
  catalogNumber?: string; // e.g. "Op. 27 No. 2", "BWV 846"
  yearComposed?: string;
  instrumentation?: string;
  keySignature?: string;
  description?: string;
  scores: Score[];
  updatedAt: string; // ISO timestamp, used for cache freshness
  // True only for records parsed from a full IMSLP page. Search hits produce
  // lightweight stubs (complete: false) with empty scores — the cache must not
  // serve those to a detail page, so getWork re-fetches when false.
  complete?: boolean;
}

export interface SearchResult {
  query: string;
  works: Work[];
  composers: Composer[];
  total: number;
}
