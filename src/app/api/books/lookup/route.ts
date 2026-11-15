import { getCmsBookByIsbn } from "@/lib/books/microcms-books";
import { lookupPublisherCover } from "@/lib/books/publisher-cover";
import type { LookupBook } from "@/components/book-form/isbn-registration.types";
import { lookupOpenBd } from "@/lib/books/openbd";
import { lookupGoogleBooks } from "@/lib/books/google-books";
import { isValidIsbn, normalizeIsbn } from "@/components/book-form/book-form.validation";
import { auth } from "@/auth";
import { authConfigured, isLocalDevelopment, isOwner } from "@/lib/auth/owner";

export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!isLocalDevelopment(new URL(request.url)) && (!authConfigured() || !isOwner((await auth())?.user?.id))) return Response.json({ error: "authentication-required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const origin = request.headers.get("origin");
  const localStory = process.env.NODE_ENV === "development" && (origin === "http://localhost:6006" || origin === "http://127.0.0.1:6006");
  const headers = { "Cache-Control": "no-store", ...(localStory ? { "Access-Control-Allow-Origin": origin!, Vary: "Origin" } : {}) };
  const isbn = normalizeIsbn(new URL(request.url).searchParams.get("isbn") ?? "");
  if (!isValidIsbn(isbn)) return Response.json({ error: "invalid-isbn" }, { status: 400, headers });
  try {
    const existing = await getCmsBookByIsbn(isbn);
    if (existing) {
      const { title, subtitle, authors, coverSrc } = existing;
      return Response.json({ status: "registered", book: { isbn, title, subtitle, authors, coverSrc } }, { headers });
    }
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(20000)]);
    async function found(book: LookupBook) {
      const publisherCover = book.coverSrc ? undefined : await lookupPublisherCover(isbn, signal);
      return Response.json({ status: "found", book: { ...book, ...(publisherCover && { publisherCover }) } }, { headers });
    }
    const direct = await lookupGoogleBooks(isbn, [`isbn:${isbn}`], signal).catch(() => undefined);
    let fallback;
    try { fallback = await lookupOpenBd(isbn, signal); }
    catch (error) {
      if (direct) return await found({ ...direct, priceNote: "価格取得元に接続できませんでした。紙の本の税込定価は任意入力できます。" });
      throw error;
    }
    if (fallback.status !== "found") return direct ? await found({ ...direct, priceNote: "紙の本の税込定価を確認できませんでした。電子書籍の販売価格は使用していません。" }) : Response.json(fallback, { headers });
    if (direct) return await found({ ...direct, ...(!direct.subtitle && fallback.book.subtitle ? { title: fallback.book.title, subtitle: fallback.book.subtitle } : {}), registeredPrice: fallback.book.registeredPrice, priceNote: fallback.book.priceNote });
    const title = fallback.book.title;
    const compact = title.replace(/\s+/g, "");
    const queries = [title, compact, compact.replace(/^初めてだけどやさしくわかる/, "").replace(/\s*[:：].*$/, ""), compact.replace(/の教科書.*$/, "")];
    const google = await lookupGoogleBooks(isbn, queries, signal).catch(() => undefined);
    return await found({ ...(google ?? fallback.book), ...(google && !google.subtitle && fallback.book.subtitle ? { title: fallback.book.title, subtitle: fallback.book.subtitle } : {}), registeredPrice: fallback.book.registeredPrice, priceNote: fallback.book.priceNote });
  } catch {
    return Response.json({ error: "lookup-unavailable" }, { status: 502, headers });
  }
}
