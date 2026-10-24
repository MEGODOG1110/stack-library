"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookshelfScreen } from "@/components/bookshelf/BookshelfScreen";
import { shelfAreas, shelfBooks, shelfTags } from "@/components/bookshelf/bookshelf.fixtures";
import type { ShelfFilters } from "@/components/bookshelf/bookshelf.types";

export function BookshelfPage({ keyword, filters, view }: { keyword: string; filters: ShelfFilters; view: "shelf" | "search" }) {
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
          const book = shelfBooks.find((item) => item.id === saved.bookId);
          const label = book && `${book.title} / ${book.authors.join("・")} / 書籍を確認`;
          const button = label ? document.querySelector<HTMLButtonElement>(`button[aria-label="${CSS.escape(label)}"]`) : null;
          button?.focus({ preventScroll: true });
        }
      });
    } catch { /* 一時storageが使えなくてもURLの検索条件は利用できる。 */ }
  }, []);
  return <BookshelfScreen books={shelfBooks} areas={shelfAreas} tags={shelfTags} initialKeyword={keyword} initialFilters={filters} initialView={view}
    onSelectBook={(book, context) => {
      const query = new URLSearchParams();
      if (context.keyword) query.set("q", context.keyword);
      context.filters.areaIds.forEach((id) => query.append("area", id));
      context.filters.tagIds.forEach((id) => query.append("tag", id));
      const returnTo = query.size ? `/?${query}` : "/";
      try { sessionStorage.setItem("sl-shelf-return-v1", JSON.stringify({ href: returnTo, scrollY: window.scrollY, bookId: book.id })); } catch { /* URLで条件は保持。 */ }
      window.history.replaceState(window.history.state, "", returnTo);
      router.push(`/books/${encodeURIComponent(book.id)}?from=${encodeURIComponent(returnTo)}`);
    }} />;
}
