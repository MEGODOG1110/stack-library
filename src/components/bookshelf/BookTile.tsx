import { BookCover } from "./BookCover";
import type { ShelfBook } from "./bookshelf.types";
import styles from "./BookTile.module.css";

type BookTileProps = {
  book: ShelfBook;
  loading?: boolean;
  onSelect: (book: ShelfBook) => void;
};

export function BookTile({ book, onSelect, loading = false }: BookTileProps) {
  return (
    <div className={styles["SL-ly_book-tile"]}>
    <button
      className={styles["SL-el_book-tile"]}
      type="button"
      aria-label={`${book.title} / ${book.authors.join("・")} / 書籍を確認`}
      aria-busy={loading || undefined}
      onClick={() => onSelect(book)}
    >
      <BookCover src={book.coverSrc} />
    </button>
    <span className={styles["SL-el_book-tile__loading"]} aria-live="polite">{loading ? "読み込み中" : ""}</span>
    </div>
  );
}
