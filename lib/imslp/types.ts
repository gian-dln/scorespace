/**
 * Raw shapes returned by IMSLP's MediaWiki API (imslp.org/api.php).
 * IMSLP runs an old MediaWiki version: revision content comes back as
 * revisions[].* (no content "slots"), and there's no dedicated full-text
 * search for a single query across "works + composers" — we search
 * namespace 0 (work pages) and namespace 14 (composer category pages)
 * separately via action=query&list=search.
 *
 * There's also a legacy custom endpoint (imslpscripts/API.ISCR.php) that
 * dumps the entire work/people list for cache pre-warming — see
 * IMSLP:API on-wiki. It's not used here since it has no query parameter.
 */

export interface ImslpSearchHit {
  ns: number;
  title: string;
  snippet: string;
}

export interface ImslpSearchResponse {
  query: {
    search: ImslpSearchHit[];
  };
}

export interface ImslpPageRevision {
  "*": string; // raw wikitext
}

export interface ImslpPage {
  pageid: number;
  ns: number;
  title: string;
  missing?: string;
  fullurl?: string;
  revisions?: ImslpPageRevision[];
}

export interface ImslpPageResponse {
  query: {
    pages: Record<string, ImslpPage>;
  };
}
