import { shelfBooks } from "../bookshelf/bookshelf.fixtures";
import type { IsbnLookup } from "./isbn-registration.types";
/** 画面確認用の補完。外部書誌APIを呼んだとは扱わない。 */
export const sampleIsbnLookup: IsbnLookup = async (isbn, signal) => {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 250);
    signal.addEventListener("abort", () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
  });
  const book = shelfBooks.find((item) => item.isbn === isbn);
  return book ? { status: "found", book: { title: book.title, authors: book.authors, isbn, coverSrc: book.coverSrc } } : { status: "not-found" };
};
