import { normalizeIsbn, isValidIsbn } from "@/components/book-form/book-form.validation";
import { notFound, redirect } from "next/navigation";
import { getCmsBook, getCmsBookByIsbn } from "@/lib/books/microcms-books";
import { DetailNavigation } from "./DetailNavigation";

export default async function BookDetailPage({ params, searchParams }: {
  params: Promise<{ contentId: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const [{ contentId }, query] = await Promise.all([params, searchParams]);
  const canonical = normalizeIsbn(contentId);
  const isbnPath = isValidIsbn(canonical);
  if (/^\d{13}$/.test(canonical) && !isbnPath) notFound();
  const book = isbnPath ? await getCmsBookByIsbn(canonical) : await getCmsBook(contentId);
  if (!book) notFound();
  let returnTo = "/";
  if (typeof query.from === "string") {
    try {
      const url = new URL(query.from, "https://stack-library.invalid");
      if (url.origin === "https://stack-library.invalid" && url.pathname === "/") returnTo = url.pathname + url.search;
    } catch { /* 不正な戻り先は本棚へ。 */ }
  }
  if (!book.isbn || !isValidIsbn(book.isbn)) notFound();
  if (contentId !== book.isbn) redirect(`/books/${book.isbn}${returnTo !== "/" ? `?from=${encodeURIComponent(returnTo)}` : ""}`);
  return <main><DetailNavigation book={book} returnTo={returnTo} /></main>;
}
