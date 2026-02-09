export const slugify = (text: string): string => {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const ensureUniqueSlug = async (
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  const normalizedBase = baseSlug || "post";
  let candidate = normalizedBase;
  let counter = 1;

  while (await exists(candidate)) {
    counter += 1;
    candidate = `${normalizedBase}-${counter}`;
  }

  return candidate;
};
