import { BookCover } from "./BookCover";
import type { ShelfBook } from "./bookshelf.types";
import styles from "./BookTile.module.css";

type BookTileProps = {
  book: ShelfBook;
  onSelect: (book: ShelfBook) => void;
};

export function BookTile({ book, onSelect }: BookTileProps) {
  return (
    <button
      className={styles["SL-el_book-tile"]}
      type="button"
      aria-label={`${book.title} / ${book.authors.join("・")} / 書籍を確認`}
      onClick={() => onSelect(book)}
    >
      <BookCover src={book.coverSrc} />
    </button>
  );
}
