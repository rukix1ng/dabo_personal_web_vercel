const DEFAULT_DEV_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_BASE_URL) ||
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeSiteUrl(process.env.VERCEL_URL) ||
    DEFAULT_DEV_SITE_URL
  );
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl());
}

export function getAbsoluteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}
