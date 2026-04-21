/** Convert a company name to a URL-safe slug.  e.g. "AURA Clothing Co." → "aura-clothing-co" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars except dash
    .replace(/[\s_]+/g, '-')    // spaces/underscores → dash
    .replace(/-+/g, '-')        // collapse multiple dashes
    .replace(/^-+|-+$/g, '');   // trim leading/trailing dashes
}
