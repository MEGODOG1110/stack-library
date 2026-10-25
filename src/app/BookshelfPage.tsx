"use client";

import { useEffect } from "react";
import { normalizeIsbn } from "@/components/book-form/book-form.validation";
import { useRouter } from "next/navigation";
import { BookshelfScreen } from "@/components/bookshelf/BookshelfScreen";
import type { ShelfBook, ShelfOption, ShelfFilters } from "@/components/bookshelf/bookshelf.types";

export function BookshelfPage({ keyword, filters, view, books, areas, tags, error }: { keyword: string; filters: ShelfFilters; view: "shelf" | "search"; books: ShelfBook[]; areas: ShelfOption[]; tags: ShelfOption[]; error?: string }) {
  const router = useRouter();
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("sl-shelf-return-v1");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.href !== location.pathname + location.search) return;
      sessionStorage.removeItem("sl-shelf-return-v1");
      requestAnimationFrame(() => {
        if (Number.isFinite(saved.scrollY)) window.scrollTo(0, saved.scrollY);
        if (typeof saved.bookId === "string") {
          const book = books.find((item) => item.id === saved.bookId);
          const label = book && `${book.title} / ${book.authors.join("・")} / 書籍を確認`;
          const button = label ? document.querySelector<HTMLButtonElement>(`button[aria-label="${CSS.escape(label)}"]`) : null;
          button?.focus({ preventScroll: true });
        }
      });
    } catch { /* 一時storageが使えなくてもURLの検索条件は利用できる。 */ }
  }, [books]);
  return <BookshelfScreen books={books} areas={areas} tags={tags} error={error} onRetry={()=>router.refresh()} initialKeyword={keyword} initialFilters={filters} initialView={view}
    onAddBook={() => router.push("/books/new")}
    onSelectBook={(book, context) => {
      const query = new URLSearchParams();
      if (context.keyword) query.set("q", context.keyword);
      context.filters.areaIds.forEach((id) => query.append("area", id));
      context.filters.tagIds.forEach((id) => query.append("tag", id));
      const returnTo = query.size ? `/?${query}` : "/";
      try { sessionStorage.setItem("sl-shelf-return-v1", JSON.stringify({ href: returnTo, scrollY: window.scrollY, bookId: book.id })); } catch { /* URLで条件は保持。 */ }
      window.history.replaceState(window.history.state, "", returnTo);
      router.push(`/books/${normalizeIsbn(book.isbn ?? "")}?from=${encodeURIComponent(returnTo)}`);
    }} />;
}
