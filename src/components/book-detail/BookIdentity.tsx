import { BookCover } from "../bookshelf/BookCover";
import type { BookDetail } from "./book-detail.types";
import styles from "./BookIdentity.module.css";

export function BookIdentity({ book }: { book: Pick<BookDetail, "title" | "authors" | "coverSrc" | "isbn" | "publisher" | "editionPublicationText"> }) {
  return <header className={styles["SL-ly_book-identity"]}>
    <BookCover src={book.coverSrc} size="detail" />
    <div className={styles["SL-ly_book-identity__body"]}>
      <h1>{book.title}</h1>
      <p>{book.authors.join("・")}</p>
      {(book.publisher || book.editionPublicationText) && <p>{[book.publisher, book.editionPublicationText].filter(Boolean).join(" / ")}</p>}
      <p className={styles["SL-el_book-identity__isbn"]}>ISBN {book.isbn || "未登録"}</p>
    </div>
  </header>;
}
