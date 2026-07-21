import { createHash } from "node:crypto";
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
    scores: extractScores(wikitext),
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

/** Scores live in one or more {{#fte:imslpfile ...}} blocks. Each block can
 * hold several numbered files: "File Name N=foo.pdf" paired with
 * "File Description N=...". IMSLP doesn't store the PDF's URL in wikitext, but
 * the file is served from MediaWiki's canonical hash path, which we can rebuild
 * from the filename alone (see imslpFileUrl) — so each score links straight to
 * its PDF. */
function extractScores(wikitext: string): Score[] {
  const scores: Score[] = [];

  for (const body of extractBalancedBlocks(wikitext, "{{#fte:imslpfile")) {
    // Map "File Description N" by its index N so we can pair it to "File Name N".
    const descriptions = new Map<string, string>();
    for (const m of body.matchAll(/\|\s*File Description\s*(\d*)\s*=\s*([^\n|]*)/gi)) {
      const desc = m[2].trim().replace(/\[\[|\]\]/g, "");
      if (desc) descriptions.set(m[1], desc);
    }

    for (const m of body.matchAll(/\|\s*File Name\s*(\d*)\s*=\s*([^\n|]*?\.pdf)/gi)) {
      const filename = m[2].trim();
      const label = descriptions.get(m[1]) || filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
      scores.push({ id: `score-${scores.length}`, label, url: imslpFileUrl(filename) });
    }
  }

  return scores;
}

/** Returns the inner body of each `${open} ... }}` template, matching braces so
 * nested templates (e.g. {{LinkEd|...}}) don't terminate the block early — the
 * flaw that made the old single-regex approach drop every file after the first. */
function extractBalancedBlocks(wikitext: string, open: string): string[] {
  const bodies: string[] = [];
  let i = wikitext.indexOf(open);

  while (i !== -1) {
    let depth = 0;
    let j = i;
    for (; j < wikitext.length - 1; j++) {
      if (wikitext[j] === "{" && wikitext[j + 1] === "{") {
        depth++;
        j++;
      } else if (wikitext[j] === "}" && wikitext[j + 1] === "}") {
        depth--;
        j++;
        if (depth === 0) break;
      }
    }
    bodies.push(wikitext.slice(i + open.length, j - 1));
    i = wikitext.indexOf(open, j + 1);
  }

  return bodies;
}

/** Rebuilds a file's canonical IMSLP URL from its name. MediaWiki stores each
 * upload at /images/<h>/<hh>/<Canonical_Name>, where the hash is md5 of the
 * canonical title (trimmed, whitespace → underscores, first letter uppercased)
 * and <h>/<hh> are its first one/two hex chars. Verified against IMSLP's
 * imageinfo API. Note: this is the true PDF; IMSLP may show a one-time bot-check
 * before serving it to a cold visitor. */
function imslpFileUrl(rawFilename: string): string {
  const name = capitalizeFirst(rawFilename.trim().replace(/\s+/g, "_"));
  const hash = createHash("md5").update(name).digest("hex");
  return `https://imslp.org/images/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(name)}`;
}

function capitalizeFirst(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
