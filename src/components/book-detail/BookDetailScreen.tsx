import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookIdentity } from "./BookIdentity";
import { BookMetadata } from "./BookMetadata";
import { BookTags } from "./BookTags";
import type { BookDetail } from "./book-detail.types";
import styles from "./BookDetailScreen.module.css";

const statusLabels = { tsundoku: "積読", reading: "読書中", read: "読了" };
const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" });

export function BookDetailScreen({ book, backControl, shelfControl, searchControl }: {
  book: BookDetail;
  backControl?: ReactNode;
  shelfControl?: ReactNode;
  searchControl?: ReactNode;
}) {
  const price = book.registeredPrice;
  const priceLabel = price === undefined ? undefined : Number.isFinite(price) && price >= 0 ? yen.format(price) : "価格を表示できません";
  return <div className={styles["SL-ly_book-detail"]}>
    <nav className={styles["SL-ly_book-detail__navigation"]} aria-label="メインナビゲーション">
      {shelfControl ?? <Link href="/"><Image src="/mockups/bookshelf/desktop/home.svg" width={20} height={20} alt="" unoptimized />本棚</Link>}
      {searchControl ?? <Link href="/?view=search"><Image src="/mockups/bookshelf/desktop/search.svg" width={20} height={20} alt="" unoptimized />検索</Link>}
      <Link href="/books/new"><Image src="/mockups/bookshelf/desktop/add.svg" width={20} height={20} alt="" unoptimized />追加</Link>
      <button disabled><Image src="/mockups/bookshelf/desktop/price.svg" width={20} height={20} alt="" unoptimized /><span>金額<small>準備中</small></span></button>
    </nav>
    <div className={styles["SL-ly_book-detail__body"]}>
      <div className={styles["SL-ly_book-detail__toolbar"]}>{backControl ?? <Link href="/" aria-label="本棚に戻る"><Image src="/mockups/bookshelf/back.svg" width={20} height={20} alt="" unoptimized /></Link>}</div>
      <BookIdentity book={book} />
      <div className={styles["SL-ly_book-detail__content"]} tabIndex={0} role="region" aria-label="書籍の補足情報">
        <div className={styles["SL-ly_book-detail__ledger"]}>
          <section className={styles["SL-el_book-detail__surface"]} aria-labelledby="detail-tags"><h2 id="detail-tags">技術タグ</h2><BookTags tags={book.tags} /></section>
          <section className={styles["SL-el_book-detail__surface"]} aria-labelledby="detail-ledger"><h2 id="detail-ledger">蔵書情報</h2>
            <BookMetadata items={[{ label: "登録価格（税込）", value: priceLabel }, { label: "読書状況", value: book.readingStatus ? statusLabels[book.readingStatus] : undefined }]} />
            <button disabled className={styles["SL-el_book-detail__status-action"]}>読書状況の変更（準備中）</button>
          </section>
        </div>
        <section className={styles["SL-el_book-detail__overview"]} aria-labelledby="detail-summary"><h2 id="detail-summary">概要</h2><p className={styles["SL-el_book-detail__surface"]}>{book.summary?.trim() ? book.summary : "未登録"}</p></section>
      </div>
    </div>
  </div>;
}
