import type { PublisherCover } from "@/components/book-form/isbn-registration.types";

const oreillyOrigin = "https://www.oreilly.co.jp";

export function isOreillyCover(url: URL, isbn: string) {
  const image = /^\/books\/images\/picture_large([\d-]+)\.(?:jpe?g|png|webp)$/i.exec(url.pathname);
  return url.origin === oreillyOrigin && !url.username && !url.password && !url.search && !url.hash
    && image?.[1].replaceAll("-", "") === isbn;
}

export async function lookupPublisherCover(isbn: string, signal: AbortSignal): Promise<PublisherCover | undefined> {
  if (!/^978(?:48144\d{5}|487311\d{4})$/.test(isbn)) return undefined;
  const pageUrl = `${oreillyOrigin}/books/${isbn}/`;
  try {
    const response = await fetch(pageUrl, { cache: "no-store", redirect: "error", signal: AbortSignal.any([signal, AbortSignal.timeout(2500)]) });
    if (!response.ok) return undefined;
    const html = await response.text();
    const pageIsbn = /itemprop=["']isbn["'][^>]*>\s*([\d-]+)/i.exec(html)?.[1].replaceAll("-", "");
    if (pageIsbn !== isbn) return undefined;
    const image = /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i.exec(html)?.[1];
    const imageUrl = image ? new URL(image, pageUrl) : undefined;
    const src = imageUrl && isOreillyCover(imageUrl, isbn) ? imageUrl.href : undefined;
    return { src, pageUrl, publisher: "オライリー・ジャパン" };
  } catch {
    return undefined;
  }
}
