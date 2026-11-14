import { useId, type ReactNode } from "react";
import { BookTile } from "./BookTile";
import type { ShelfBook } from "./bookshelf.types";
import styles from "./BookShelf.module.css";

export function BookShelf({ label, books, onSelect, announceCount = false, emptyContent, loadingBookId }: { label: string; books: readonly ShelfBook[]; onSelect: (book: ShelfBook) => void; announceCount?: boolean; emptyContent?: ReactNode; loadingBookId?: string }) {
  const headingId = useId();
  return <section className={styles["SL-ly_book-shelf"]} aria-labelledby={headingId}><header className={styles["SL-ly_book-shelf__header"]}><h2 id={headingId}>{label}</h2>{announceCount && <span role="status">{books.length}冊</span>}</header>{books.length === 0 ? emptyContent : <ul className={styles["SL-ly_book-shelf__books"]}>{books.map((book) => <li key={book.id}><BookTile book={book} onSelect={onSelect} loading={book.id === loadingBookId} /></li>)}</ul>}</section>;
}
