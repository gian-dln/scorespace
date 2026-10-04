/**
 * A deliberately curated discovery list for the empty-search state. IMSLP's
 * MediaWiki API has no popularity signal, so search ranking or category order
 * would be misleading and unstable here. IDs are IMSLP composer-category
 * names, used directly by the existing composer filter.
 */
export const POPULAR_COMPOSERS = [
  { id: "Bach, Johann Sebastian", name: "J. S. Bach" },
  { id: "Beethoven, Ludwig van", name: "Ludwig van Beethoven" },
  { id: "Chopin, Frédéric", name: "Frédéric Chopin" },
  { id: "Debussy, Claude", name: "Claude Debussy" },
  { id: "Mozart, Wolfgang Amadeus", name: "W. A. Mozart" },
  { id: "Rachmaninoff, Sergei", name: "Sergei Rachmaninoff" },
  { id: "Schubert, Franz", name: "Franz Schubert" },
  { id: "Tchaikovsky, Pyotr", name: "Pyotr Ilyich Tchaikovsky" },
] as const;
