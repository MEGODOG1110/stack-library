import { bookAreas, splitKeywords } from "./classification";
/** Content API専用。Management APIや画像uploadは扱わない。 */
export class RegistrationError extends Error {
  constructor(public code: string, public httpStatus: number) { super(code); }
}
export function toBooksPayload(input: unknown) {
  if (!input || typeof input !== "object") throw new RegistrationError("invalid-input", 400);
  const value = input as Record<string, unknown>;
  const text = (key: string) => typeof value[key] === "string" ? (value[key] as string).trim() : "";
  const title = text("title");
  const authors = Array.isArray(value.authors) ? value.authors.filter((x): x is string => typeof x === "string").map(x => x.trim()).filter(Boolean) : [];
  if (!title || !authors.length) throw new RegistrationError("title-authors-required", 400);
  const isbn = text("isbn").normalize("NFKC").replace(/[-\s]/g, "");
  if (!/^(978|979)\d{10}$/.test(isbn) || [...isbn].reduce((sum, n, i) => sum + Number(n) * (i % 2 ? 3 : 1), 0) % 10 !== 0) throw new RegistrationError("invalid-isbn", 400);
  let cover: URL;
  try { cover = new URL(text("cover")); } catch { throw new RegistrationError("cms-cover-required", 422); }
  if (cover.protocol !== "https:" || cover.hostname !== "images.microcms-assets.io" || cover.username || cover.password) throw new RegistrationError("cms-cover-required", 422);
  const ids = value.areaIds ?? [];
  if (!Array.isArray(ids) || ids.some(id => !bookAreas.some(area=>area.id===id))) throw new RegistrationError("invalid-areas", 400);
  if (value.keywords !== undefined && typeof value.keywords !== "string") throw new RegistrationError("invalid-keywords", 400);
  const keywords = splitKeywords(text("keywords")).join("\n");
  const price = value.registeredPrice;
  if (price !== undefined && (typeof price !== "number" || !Number.isFinite(price) || price < 0)) throw new RegistrationError("invalid-price", 400);
  return { ...(ids.length ? { technicalAreas: bookAreas.filter(area=>ids.includes(area.id)).map(area=>area.label) } : {}), ...(keywords ? { keywords } : {}), title, authors: authors.join("\n"), cover: cover.href, publication: { fieldId: "publication", isbn, ...(text("publisher") ? { publisher: text("publisher") } : {}), ...(price !== undefined ? { price } : {}) }, reading: { fieldId: "reading", status: ["積読"], favorite: false } };
}

export async function registerInMicrocms(input: unknown, resolveCover?: (isbn: string) => Promise<string>) {
  const payload = toBooksPayload(input);
  const service = process.env.MICROCMS_SERVICE_DOMAIN;
  const key = process.env.MICROCMS_API_KEY;
  if (service !== "stack-library" || !key) throw new RegistrationError("cms-not-configured", 503);
  const base = `https://${service}.microcms.io/api/v1/books`;
  const headers = { "X-MICROCMS-API-KEY": key };
  const isbn = payload.publication.isbn;
  // 既存CMSのハイフン付きISBNも正規化して重複を確認する。
  for (let offset = 0; ; ) {
    const url = new URL(base); url.searchParams.set("limit", "100"); url.searchParams.set("offset", String(offset)); url.searchParams.set("fields", "id,publication"); url.searchParams.set("orders", "createdAt,id");
    const existing = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!existing.ok) throw new RegistrationError("cms-read-failed", 502);
    const page = await existing.json();
    if (!Array.isArray(page.contents) || !Number.isInteger(page.totalCount)) throw new RegistrationError("cms-read-failed", 502);
    if (page.contents.some((item: { publication?: { isbn?: string } }) => typeof item.publication?.isbn === "string" && item.publication.isbn.normalize("NFKC").replace(/[-\s]/g, "") === isbn)) throw new RegistrationError("isbn-already-registered", 409);
    offset += page.contents.length;
    if (offset >= page.totalCount) break;
    if (!page.contents.length) throw new RegistrationError("cms-read-failed", 502);
  }
  if (resolveCover) payload.cover = await resolveCover(isbn);
  // timeoutやread-back失敗後は自動再送しない。
  let contentId: string;
  try {
    const response = await fetch(base, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new RegistrationError("cms-create-rejected", 502);
    const data = await response.json();
    if (typeof data.id !== "string") throw new Error("missing id");
    contentId = data.id;
  } catch (error) { if (error instanceof RegistrationError) throw error; throw new RegistrationError("registration-unknown", 503); }
  try {
    const check = await fetch(`${base}/${encodeURIComponent(contentId)}`, { headers, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!check.ok) throw new Error("readback");
    const saved = await check.json();
    if ((saved.keywords ?? "") !== (payload.keywords ?? "") || JSON.stringify([...(saved.technicalAreas ?? [])].sort()) !== JSON.stringify([...(payload.technicalAreas ?? [])].sort()) || saved.title !== payload.title || saved.authors !== payload.authors || saved.cover?.url !== payload.cover || (saved.publication?.isbn ?? "") !== (payload.publication.isbn ?? "") || (saved.publication?.publisher ?? "") !== (payload.publication.publisher ?? "") || (saved.publication?.price ?? undefined) !== payload.publication.price || !saved.reading?.status?.includes("積読")) throw new Error("mismatch");
    return { contentId };
  } catch { throw new RegistrationError("registration-unknown", 503); }
}
