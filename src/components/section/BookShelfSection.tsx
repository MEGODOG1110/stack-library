import { BookCard } from "@/components/card/BookCard";
import { BookShelf } from "@/components/layout/BookShelf";
import type { Book } from "@/types/book";

type BookShelfSectionProps = {
  books: Book[];
};

export function BookShelfSection({ books }: BookShelfSectionProps) {
  const priorityBookIds = new Set(books.slice(0, 2).map((book) => book.contentId));

  return (
    <section aria-labelledby="book-catalog-title" className="SL-el_book-catalog">
      <div className="SL-el_book-catalog__heading">
        <h1 id="book-catalog-title">蔵書一覧</h1>
        <p className="SL-el_book-catalog__count">{books.length}冊</p>
      </div>
      <BookShelf>
        <ul aria-label="技術書の一覧" className="SL-el_book-catalog__grid">
          {books.map((book) => (
            <li className="SL-el_book-catalog__item" key={book.contentId}>
              <BookCard
                book={book}
                priority={priorityBookIds.has(book.contentId)}
              />
            </li>
          ))}
        </ul>
      </BookShelf>
    </section>
  );
}
