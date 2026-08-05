/**
 * Single source of truth for the taxonomy used by the admin forms and the
 * public search filters. Previously these lists were duplicated across
 * AdminPageClient / update-post / update-celebrity / Search, which is why the
 * country list in "Update Celebrity" only had 10 entries while the create form
 * had 25.
 */

export const GENDERS = ["men", "women", "kids"] as const;
export type GenderValue = (typeof GENDERS)[number];

export const PROFESSIONS = ["actor", "actress", "artist", "sports", "other"] as const;
export type ProfessionValue = (typeof PROFESSIONS)[number];

export const COUNTRIES = [
  "United States", "China", "India", "Brazil", "Russia", "United Kingdom", "France", "Germany",
  "Japan", "Canada", "South Korea", "Italy", "Australia", "Spain", "Mexico", "Indonesia",
  "Netherlands", "Saudi Arabia", "Turkey", "Switzerland", "Sweden", "Poland", "Belgium",
  "Norway", "Argentina",
] as const;

export const PRODUCT_CATEGORIES = [
  "shirt", "pant", "suits", "t-shirts", "jeans", "trousers", "chinos",
  "blazers", "jackets", "ethnic wear", "activewear", "shorts",
  "footwear", "eyewear", "accessories", "skirt", "tops", "blouses",
  "leggings", "sarees",
] as const;

/** ImageKit folders. Keeps upload call sites from hand-writing path strings. */
export const IMAGE_FOLDERS = {
  dp: "/dp",
  celebrities: "/celebrities",
  products: "/products",
} as const;

export type ImageFolder = (typeof IMAGE_FOLDERS)[keyof typeof IMAGE_FOLDERS];

export const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Normalises a user-pasted URL down to `domain/path` form, which is what the
 * database stores (the UI re-adds `https://` when linking out).
 * Handles the malformed variants admins actually paste: "https//x",
 * "https://https://x", stray whitespace and a leading "www.".
 */
export const sanitizeUrl = (url: string) => {
  let clean = (url ?? "").trim();
  clean = clean.replace(/^((https?:\/\/)+|https?\/\/)/i, "");
  clean = clean.replace(/^www\./i, "");
  return clean;
};
