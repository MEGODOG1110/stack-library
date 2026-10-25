import type { LookupBook } from "@/components/book-form/isbn-registration.types";
type Volume = { id?: string; volumeInfo?: { title?: string; authors?: string[]; publisher?: string; publishedDate?: string; industryIdentifiers?: { type: string; identifier: string }[]; imageLinks?: Record<string, string> } };
async function request(path: string, signal: AbortSignal) {
  const url = new URL(`https://www.googleapis.com/books/v1/${path}`);
  url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY!);
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) {
    // 上流の本文・URLにはキーやIPが含まれ得るため記録しない。
    const body = await response.json().catch(() => undefined);
    const reasons = ["API_KEY_IP_ADDRESS_BLOCKED", "API_KEY_HTTP_REFERRER_BLOCKED", "API_KEY_INVALID", "API_KEY_SERVICE_BLOCKED", "SERVICE_DISABLED", "RATE_LIMIT_EXCEEDED", "IP_REFERER_BLOCKED", "dailyLimitExceeded", "quotaExceeded", "accessNotConfigured", "keyInvalid"];
    const reported = body?.error?.details?.flatMap((detail: { reason?: string }) => detail.reason ? [detail.reason] : []) ?? [];
    const legacy = body?.error?.errors?.map((error: { reason?: string }) => error.reason) ?? [];
    console.warn("google-books-request-failed", { status: response.status, reason: [...reported, ...legacy].find((reason: unknown) => typeof reason === "string" && reasons.includes(reason)) ?? "unknown" });
    throw new Error("Google Books unavailable");
  }
  return response.json();
}
/** 外部候補はISBN完全一致のみ採用。キーや生レスポンスをクライアントへ渡さない。 */
export async function lookupGoogleBooks(isbn: string, queries: string[], signal: AbortSignal): Promise<LookupBook | undefined> {
  if (!process.env.GOOGLE_BOOKS_API_KEY) return undefined;
  for (const query of [...new Set(queries)]) {
    const data = await request(`volumes?q=${encodeURIComponent(query)}&maxResults=20`, signal);
    const candidate = (Array.isArray(data.items) ? data.items : []).find((item: Volume) => item.volumeInfo?.industryIdentifiers?.some((id) => id.type === "ISBN_13" && id.identifier === isbn)) as Volume | undefined;
    if (!candidate?.id) continue;
    const detail: Volume = await request(`volumes/${encodeURIComponent(candidate.id)}`, signal);
    const value = detail.volumeInfo;
    if (!value?.industryIdentifiers?.some((id) => id.type === "ISBN_13" && id.identifier === isbn) || !value.title) continue;
    const image = value.imageLinks;
    const cover = image?.medium ?? image?.small ?? image?.thumbnail ?? image?.smallThumbnail;
    let coverSrc: string | undefined;
    if (cover) {
      const url = new URL(cover);
      if (["books.google.com", "books.googleusercontent.com"].includes(url.hostname) && ["http:", "https:"].includes(url.protocol)) {
        url.protocol = "https:";
        url.searchParams.delete("edge");
        coverSrc = url.href;
      }
    }
    return { isbn, title: value.title, authors: value.authors ?? [], publisher: value.publisher, editionPublicationText: value.publishedDate, coverSrc };
  }
}
