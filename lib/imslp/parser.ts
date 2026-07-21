import type { Composer, Score, Work } from "@/types";
import type { ImslpPageResponse, ImslpSearchHit } from "./types";

/**
 * Normalizes a raw IMSLP work page (fetched via getImslpPage) into a Work.
 * IMSLP work pages don't have a "Composer" field — the composer's name is
 * embedded in the page title as a trailing "(Name)", so we parse it from
 * there rather than the wikitext body.
 */
export function parseWorkFromImslpPage(raw: ImslpPageResponse): Work | null {
  const page = Object.values(raw.query.pages)[0];
  if (!page || page.missing !== undefined) return null;

  const wikitext = page.revisions?.[0]?.["*"] ?? "";
  const composerName = extractComposerFromTitle(page.title);

  return {
    id: page.title,
    title: extractInfoboxField(wikitext, "Work Title") ?? stripComposerFromTitle(page.title),
    composer: composerName ? { id: composerCategoryId(composerName), name: composerName } : { id: "unknown", name: "Unknown" },
    imslpUrl: page.fullurl ? withProtocol(page.fullurl) : `https://imslp.org/wiki/${encodeURIComponent(page.title)}`,
    catalogNumber: extractInfoboxField(wikitext, "Opus/Catalogue Number"),
    yearComposed: extractInfoboxField(wikitext, "Year/Date of Composition"),
    instrumentation: extractInfoboxField(wikitext, "Instrumentation"),
    keySignature: extractTemplateValue(wikitext, "Key"),
    scores: extractScores(wikitext, page.fullurl ? withProtocol(page.fullurl) : undefined),
    updatedAt: new Date().toISOString(),
    complete: true,
  };
}

/** Normalizes a raw IMSLP composer page. Composer bios live at
 * "Category:<Name>" (MediaWiki namespace 14), using a {{#fte:person}}
 * template with separate Born/Died Year/Month/Day fields. */
export function parseComposerFromImslpPage(raw: ImslpPageResponse): Composer | null {
  const page = Object.values(raw.query.pages)[0];
  if (!page || page.missing !== undefined) return null;

  const wikitext = page.revisions?.[0]?.["*"] ?? "";
  const name = page.title.replace(/^Category:/, "");

  return {
    id: name,
    name,
    imslpUrl: page.fullurl ? withProtocol(page.fullurl) : `https://imslp.org/wiki/${encodeURIComponent(page.title)}`,
    birthYear: extractNumberField(wikitext, "Born Year"),
    deathYear: extractNumberField(wikitext, "Died Year"),
    nationality: extractInfoboxField(wikitext, "Nationality"),
    complete: true,
  };
}

/** Search hits only carry a title + snippet, not the full page — this
 * builds a lightweight Work/Composer good enough for a results list.
 * Fetching the work/composer detail page fills in the rest. */
export function workFromSearchHit(hit: ImslpSearchHit): Work | null {
  const composerName = extractComposerFromTitle(hit.title);
  if (!composerName) return null;

  return {
    id: hit.title,
    title: stripComposerFromTitle(hit.title),
    composer: { id: composerCategoryId(composerName), name: composerName },
    imslpUrl: `https://imslp.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`,
    scores: [],
    updatedAt: new Date().toISOString(),
    complete: false,
  };
}

export function composerFromSearchHit(hit: ImslpSearchHit): Composer | null {
  const name = hit.title.replace(/^Category:/, "");
  if (!name) return null;

  return {
    id: name,
    name,
    imslpUrl: `https://imslp.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`,
    complete: false,
  };
}

function withProtocol(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

/** The composer's own page lives at "Category:<Name>" — we use the bare
 * name as our composer id, and re-add the "Category:" prefix when looking
 * the page up on IMSLP (see getComposer in lib/supabase/queries.ts). */
function composerCategoryId(name: string): string {
  return name;
}

function extractComposerFromTitle(title: string): string | undefined {
  const match = title.match(/\(([^()]+)\)\s*$/);
  return match?.[1]?.trim();
}

function stripComposerFromTitle(title: string): string {
  return title.replace(/\s*\([^()]+\)\s*$/, "").trim();
}

/** Matches simple "|Field=value" wikitext params. */
function extractInfoboxField(wikitext: string, field: string): string | undefined {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = wikitext.match(new RegExp(`\\|\\s*${escaped}\\s*=\\s*([^\\n|]+)`, "i"));
  return match?.[1]?.trim().replace(/\[\[|\]\]/g, "") || undefined;
}

/** Matches "|Field={{Template|value}}" and returns the template's last argument, e.g. |Key={{Key|C}} -> "C". */
function extractTemplateValue(wikitext: string, field: string): string | undefined {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = wikitext.match(new RegExp(`\\|\\s*${escaped}\\s*=\\s*\\{\\{[^{}|]+\\|([^{}]+)\\}\\}`, "i"));
  return match?.[1]?.trim() || extractInfoboxField(wikitext, field);
}

function extractNumberField(wikitext: string, field: string): number | undefined {
  const value = extractInfoboxField(wikitext, field);
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

/** Scores are listed in one or more {{#fte:imslpfile ...}} blocks, each with
 * "File Name N=foo.pdf" / "File Description N=..." pairs. IMSLP serves the
 * actual PDFs from hashed mirror URLs that can't be derived from wikitext
 * alone, so score links point at the work page itself. */
function extractScores(wikitext: string, workUrl?: string): Score[] {
  const scores: Score[] = [];
  const fallbackUrl = workUrl ?? "https://imslp.org";

  for (const block of wikitext.matchAll(/\{\{#fte:imslpfile([\s\S]*?)\}\}/g)) {
    const body = block[1];
    for (const fileMatch of body.matchAll(/File Name \d*=\s*([^\n]+\.pdf)/gi)) {
      const filename = fileMatch[1].trim();
      const descMatch = body.match(/File Description \d*=\s*([^\n]+)/i);
      scores.push({
        id: `score-${scores.length}`,
        label: descMatch?.[1]?.trim() || filename.replace(/\.pdf$/i, "").replace(/[_-]/g, " "),
        url: fallbackUrl,
      });
    }
  }

  return scores;
}
