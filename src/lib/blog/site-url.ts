export const getSiteUrl = (): string => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required");
  }

  return siteUrl.replace(/\/+$/, "");
};

