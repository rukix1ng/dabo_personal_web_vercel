import type { Locale } from "@/lib/i18n";

export type NewsLinkType = "none" | "external" | "internal";
export type InternalLinkKind = "invitation" | "news_column";

export type ParsedInternalLink =
  | { kind: "invitation"; id: number }
  | { kind: "news_column"; id: number };

export function buildInternalLinkValue(kind: InternalLinkKind, id: number): string {
  return `${kind}:${id}`;
}

export function parseInternalLinkValue(value: string | null | undefined): ParsedInternalLink | null {
  if (!value) return null;

  const match = value.match(/^(invitation|news_column):(\d+)$/);
  if (!match) return null;

  return {
    kind: match[1] as InternalLinkKind,
    id: Number(match[2]),
  };
}

export function resolveNewsHref(
  locale: Locale,
  linkType: string | null | undefined,
  linkValue: string | null | undefined
): { href?: string; external?: boolean } {
  if (!linkType || linkType === "none" || !linkValue) {
    return {};
  }

  if (linkType === "external") {
    return {
      href: linkValue,
      external: true,
    };
  }

  if (linkType === "internal") {
    const parsed = parseInternalLinkValue(linkValue);
    if (!parsed) return {};

    if (parsed.kind === "invitation") {
      return {
        href: `/${locale}/forum/${parsed.id}`,
        external: false,
      };
    }

    return {
      href: `/${locale}/achievements/${parsed.id}`,
      external: false,
    };
  }

  return {};
}
