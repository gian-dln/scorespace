import type { ImslpPageResponse, ImslpSearchResponse } from "./types";

const MEDIAWIKI_API_BASE = "https://imslp.org/api.php";
const DEFAULT_TIMEOUT_MS = 8000;

// IMSLP namespaces: 0 = work pages, 14 = composer/category pages.
const WORK_NAMESPACE = 0;
const COMPOSER_NAMESPACE = 14;

export class ImslpApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ImslpApiError";
  }
}

async function imslpFetch<T>(url: URL, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // IMSLP asks bots/scripts to identify themselves, see IMSLP:API.
        "User-Agent": "ScoreSpace/0.1 (contact: deleong@tcd.ie)",
      },
    });

    if (!res.ok) {
      throw new ImslpApiError(`IMSLP request failed: ${res.status} ${res.statusText}`, res.status);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ImslpApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ImslpApiError(`IMSLP request timed out after ${timeoutMs}ms`);
    }
    throw new ImslpApiError(`IMSLP request errored: ${(err as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Makes IMSLP's search less literal. Two transforms, both verified against the
 * live API:
 *   1. Catalogue numbers get the period IMSLP indexes them with — "op38" and
 *      "op 38" both become "op.38", so "valse op38" finds "Valse, Op.38".
 *   2. Each plain word gets a trailing "*" (CirrusSearch prefix match), so a
 *      partial word like "nocturn" matches "Nocturne". This is safe: it does
 *      not change results for words already typed in full.
 *
 * It does NOT rescue very short single-word prefixes (e.g. "Rach" won't
 * surface Rachmaninoff) — IMSLP's relevance ranking buries those and the API
 * gives no way to reweight it.
 */
export function normalizeSearchQuery(query: string): string {
  const withCatalogue = query.replace(/\b(op|no)\.?\s*(\d+)\b/gi, (_m, prefix: string, num: string) => `${prefix}.${num}`);
  return withCatalogue
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => (/^[A-Za-z]{2,}$/.test(token) ? `${token}*` : token))
    .join(" ");
}

function searchUrl(query: string, namespace: number, limit: number): URL {
  const url = new URL(MEDIAWIKI_API_BASE);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", normalizeSearchQuery(query));
  url.searchParams.set("srnamespace", String(namespace));
  url.searchParams.set("srlimit", String(limit));
  return url;
}

export async function searchImslpWorks(query: string, limit = 24, offset = 0): Promise<ImslpSearchResponse> {
  const url = searchUrl(query, WORK_NAMESPACE, limit);
  if (offset > 0) url.searchParams.set("sroffset", String(offset));
  return imslpFetch<ImslpSearchResponse>(url);
}

export async function searchImslpComposers(query: string, limit = 10): Promise<ImslpSearchResponse> {
  return imslpFetch<ImslpSearchResponse>(searchUrl(query, COMPOSER_NAMESPACE, limit));
}

/** Fetch a page's wikitext + canonical url by exact title (e.g. "Symphony No.1, Op.21 (Beethoven, Ludwig van)"
 * for a work, or "Category:Beethoven, Ludwig van" for a composer). */
export async function getImslpPage(title: string): Promise<ImslpPageResponse> {
  const url = new URL(MEDIAWIKI_API_BASE);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("prop", "revisions|info");
  url.searchParams.set("rvprop", "content");
  url.searchParams.set("inprop", "url");
  url.searchParams.set("titles", title);
  return imslpFetch<ImslpPageResponse>(url);
}
