import { useId } from "react";
import { BookTile } from "./BookTile";
import type { ShelfBook } from "./bookshelf.types";
import styles from "./BookShelf.module.css";

export function BookShelf({ label, books, onSelect, announceCount = false }: { label: string; books: readonly ShelfBook[]; onSelect: (book: ShelfBook) => void; announceCount?: boolean }) {
  const headingId = useId();
  return <section aria-labelledby={headingId}><header className={styles["SL-ly_book-shelf__header"]}><h2 id={headingId}>{label}</h2><span role={announceCount ? "status" : undefined}>{books.length}冊</span></header><ul className={styles["SL-ly_book-shelf__books"]}>{books.map((book) => <li key={book.id}><BookTile book={book} onSelect={onSelect} /></li>)}</ul></section>;
}
