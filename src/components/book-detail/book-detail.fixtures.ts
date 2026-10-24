import { shelfBooks, shelfTags } from "../bookshelf/bookshelf.fixtures";
import type { BookDetail } from "./book-detail.types";

/** 既存9冊の確認済み書誌のみ参照。未取得の価格・出版情報・概要は補完しない。
 * 読書状況は既定値の表示確認用で、実際の読書状況を表さない。 */
export const detailBooks: readonly BookDetail[] = shelfBooks.map((book) => ({
  id: book.id, title: book.title, authors: book.authors, coverSrc: book.coverSrc,
  isbn: book.isbn, tags: shelfTags.filter((tag) => book.tagIds.includes(tag.id)),
  readingStatus: "tsundoku",
}));

/** 任意項目の表示検証に限る架空データ。実書籍へ架空の情報を付加しない。 */
export const specimenBook: BookDetail = {
  id: "specimen", title: "コンポーネント設計のサンプル", authors: ["サンプル著者A", "サンプル著者B"],
  coverSrc: "/mockups/bookshelf/cover.svg", publisher: "サンプル出版社",
  editionPublicationText: "第2版 / 2026年", tags: [{ id: "react", label: "React" }, { id: "design", label: "設計" }],
  registeredPrice: 3520, readingStatus: "tsundoku",
  summary: "部品の責務と状態の境界を整理するための表示確認用サンプルです。\nこの概要は架空の内容です。",
};
