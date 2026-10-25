"use client";
import Image from "next/image";
import Link from "next/link";
import { BookDetailScreen } from "@/components/book-detail/BookDetailScreen";
import type { BookDetail } from "@/components/book-detail/book-detail.types";

export function DetailNavigation({ book, returnTo }: { book: BookDetail; returnTo: string }) {
  return <BookDetailScreen book={book}
    backControl={<Link href={returnTo} aria-label="本棚に戻る"><Image className="SL-ut_theme-icon" src="/mockups/bookshelf/back.svg" width={20} height={20} alt="" unoptimized /></Link>}
    shelfControl={<Link href={returnTo}><Image className="SL-ut_theme-icon" src="/mockups/bookshelf/desktop/home.svg" width={20} height={20} alt="" unoptimized />本棚</Link>}
    searchControl={<Link href="/?view=search"><Image className="SL-ut_theme-icon" src="/mockups/bookshelf/desktop/search.svg" width={20} height={20} alt="" unoptimized />検索</Link>}
  />;
}
