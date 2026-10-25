import { normalizeIsbn, isValidIsbn } from "@/components/book-form/book-form.validation";
import { bookAreas, areaIds, splitKeywords } from "./classification";
import type { ShelfBook, ShelfOption } from "@/components/bookshelf/bookshelf.types";
import type { BookDetail } from "@/components/book-detail/book-detail.types";
type RawBook = { id: string; title: string; titleReading?: string; authors: string; createdAt: string; cover?: { url?: string }; technicalAreas?: string[]; keywords?: string; description?: string; publication?: { isbn?: string; publisher?: string; price?: number }; reading?: { status?: string[] } };
async function get(path: string) {
  const service = process.env.MICROCMS_SERVICE_DOMAIN; const key = process.env.MICROCMS_API_KEY;
  if (service !== "stack-library" || !key) throw new Error("microCMS接続設定を確認してください");
  const response = await fetch(`https://${service}.microcms.io/api/v1/books${path}`, { headers: { "X-MICROCMS-API-KEY": key }, cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (response.status === 404 && path.startsWith("/")) return null;
  if (!response.ok) throw new Error("microCMSから書籍を取得できませんでした");
  return response.json();
}
function checked(value: RawBook): RawBook {
  if (!value || typeof value.id !== "string" || typeof value.title !== "string" || typeof value.authors !== "string") throw new Error("microCMSの書籍データ形式を確認してください");
  return value;
}
const authors = (book: RawBook) => book.authors.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const tags = (book: RawBook) => splitKeywords(book.keywords ?? "");
const cover = (book: RawBook) => book.cover?.url || "/mockups/bookshelf/noimage/noimage.svg";
export async function getCmsShelf(): Promise<{ books: ShelfBook[]; areas: ShelfOption[]; tags: ShelfOption[] }> {
  const raw: RawBook[] = []; let offset = 0;
  while (true) {
    const data = await get(`?limit=100&offset=${offset}&orders=createdAt,id&depth=0`);
    if (!data || !Array.isArray(data.contents) || !Number.isInteger(data.totalCount)) throw new Error("microCMSの一覧形式を確認してください");
    raw.push(...data.contents.map(checked)); offset += data.contents.length;
    if (offset >= data.totalCount) break;
    if (!data.contents.length) throw new Error("microCMS一覧の取得が途中で停止しました");
  }
  const books = raw.map(book => ({ id: book.id, title: book.title, titleReading: book.titleReading || book.title, authors: authors(book), isbn: book.publication?.isbn ? normalizeIsbn(book.publication.isbn) : undefined, coverSrc: cover(book), areaIds: areaIds(book.technicalAreas ?? []), tagIds: tags(book), createdAt: book.createdAt }));
  const options = (values: string[]) => [...new Set(values)].sort((a,b)=>a.localeCompare(b,"ja")).map(value => ({id:value,label:value}));
  return { books, areas: [...bookAreas], tags: options(books.flatMap(book=>book.tagIds)) };
}
export async function getCmsBook(id: string): Promise<BookDetail | null> {
  const result = await get(`/${encodeURIComponent(id)}`); if (!result) return null;
  const book = checked(result); const status = book.reading?.status?.[0];
  return { id: book.id, title: book.title, authors: authors(book), coverSrc: cover(book), isbn: book.publication?.isbn ? normalizeIsbn(book.publication.isbn) : undefined, publisher: book.publication?.publisher, registeredPrice: book.publication?.price, tags: tags(book).map(label=>({id:label,label})), readingStatus: status === "積読" ? "tsundoku" : status === "読書中" ? "reading" : status === "読了" ? "read" : undefined, summary: book.description };
}

export async function getCmsBookByIsbn(isbn: string): Promise<BookDetail | null> {
  if (!isValidIsbn(isbn)) return null;
  const { books } = await getCmsShelf();
  const matches = books.filter(book=>book.isbn===isbn);
  if (matches.length > 1) throw new Error("同じISBNの書籍が複数登録されています");
  return matches.length ? getCmsBook(matches[0].id) : null;
}
