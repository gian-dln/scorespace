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

function searchUrl(query: string, namespace: number, limit: number): URL {
  const url = new URL(MEDIAWIKI_API_BASE);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("srnamespace", String(namespace));
  url.searchParams.set("srlimit", String(limit));
  return url;
}

export async function searchImslpWorks(query: string, limit = 15): Promise<ImslpSearchResponse> {
  return imslpFetch<ImslpSearchResponse>(searchUrl(query, WORK_NAMESPACE, limit));
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
