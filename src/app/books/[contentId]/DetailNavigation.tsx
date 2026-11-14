"use client";
import Image from "next/image";
import Link from "next/link";
import { BookDetailScreen } from "@/components/book-detail/BookDetailScreen";
import type { BookDetail } from "@/components/book-detail/book-detail.types";

export function DetailNavigation({ book, returnTo }: { book: BookDetail; returnTo: string }) {
  return <BookDetailScreen book={book}
    backControl={<Link href={returnTo} aria-label="本棚に戻る"><Image className="SL-ut_theme-icon" src="/mockups/bookshelf/back.svg" width={20} height={20} alt="" unoptimized /></Link>}
    shelfHref={returnTo}
  />;
}
