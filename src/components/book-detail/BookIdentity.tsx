import { BookCover } from "../bookshelf/BookCover";
import type { BookDetail } from "./book-detail.types";
import styles from "./BookIdentity.module.css";

export function BookIdentity({ book, showCover = true }: {
  book: Pick<BookDetail, "title" | "subtitle" | "authors" | "coverSrc" | "isbn" | "publisher" | "editionPublicationText">;
  showCover?: boolean;
}) {
  const subtitle = book.subtitle?.trim();

  return <header className={styles["SL-ly_book-identity"]}>
    {showCover && <BookCover src={book.coverSrc} size="detail" />}
    <div className={styles["SL-ly_book-identity__body"]}>
      <div className={styles["SL-ly_book-identity__title"]}>
        <h1>{book.title}</h1>
        {subtitle && <p className={styles["SL-el_book-identity__subtitle"]}>{subtitle}</p>}
      </div>
      <div className={styles["SL-ly_book-identity__metadata"]}>
        <p>{book.authors.join("・")}</p>
        {(book.publisher || book.editionPublicationText) && <p>{[book.publisher, book.editionPublicationText].filter(Boolean).join(" / ")}</p>}
        <p className={styles["SL-el_book-identity__isbn"]}>ISBN {book.isbn || "未登録"}</p>
      </div>
    </div>
  </header>;
}
