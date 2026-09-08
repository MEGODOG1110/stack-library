import Link from "next/link";
import { useId } from "react";

import { BookCover } from "@/components/common/BookCover";
import type { Book } from "@/types/book";

type BookCardProps = {
  book: Book;
  priority?: boolean;
};

export function BookCard({ book, priority = false }: BookCardProps) {
  const identityId = useId();
  const authorsId = useId();
  const authors = book.authors.join("、") || "著者不明";

  return (
    <Link
      aria-describedby={authorsId}
      aria-labelledby={identityId}
      className="SL-el_book-card"
      href={`/books/${book.contentId}`}
    >
      <BookCover
        book={book}
        decorative
        priority={priority}
        variant="shelf"
      />
      <span className="SL-el_book-card__identity">
        <span className="SL-el_book-card__title" id={identityId}>
          {book.title}
        </span>
        <span className="SL-el_book-card__authors" id={authorsId}>
          {authors}
        </span>
      </span>
    </Link>
  );
}
