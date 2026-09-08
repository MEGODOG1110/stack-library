import Image from "next/image";
import type { CSSProperties } from "react";

import type { Book } from "@/types/book";

type BookCoverProps = {
  book: BookCoverData;
  decorative?: boolean;
  priority?: boolean;
  variant: "shelf" | "detail" | "context";
};

export type BookCoverData = Pick<
  Book,
  "coverImageHeight" | "coverImageUrl" | "coverImageWidth" | "isbn" | "title"
>;

const sizesByVariant = {
  shelf: "(max-width: 1023px) 82px, 110px",
  detail: "(max-width: 1023px) 110px, 160px",
  context: "44px",
} as const;

type CoverStyle = CSSProperties & {
  "--cover-block-compact"?: string;
  "--cover-block-wide"?: string;
  "--cover-inline-compact"?: string;
  "--cover-inline-wide"?: string;
};

function containSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) {
  const scale = Math.min(maxWidth / width, maxHeight / height);

  return {
    height: Math.round(height * scale * 100) / 100,
    width: Math.round(width * scale * 100) / 100,
  };
}

function getCoverStyle(
  book: BookCoverData,
  variant: BookCoverProps["variant"],
): CoverStyle | undefined {
  if (variant === "shelf") return undefined;

  const width = book.coverImageWidth && book.coverImageWidth > 0 ? book.coverImageWidth : 5;
  const height = book.coverImageHeight && book.coverImageHeight > 0 ? book.coverImageHeight : 7;

  if (variant === "context") {
    const wide = containSize(width, height, 44, 60);
    const compact = containSize(width, height, 42, 60);
    return {
      "--cover-block-compact": `${compact.height}px`,
      "--cover-block-wide": `${wide.height}px`,
      "--cover-inline-compact": `${compact.width}px`,
      "--cover-inline-wide": `${wide.width}px`,
    };
  }

  const wide = containSize(width, height, 160, 224);
  const compact = containSize(width, height, 110, 154);

  return {
    "--cover-block-compact": `${compact.height}px`,
    "--cover-block-wide": `${wide.height}px`,
    "--cover-inline-compact": `${compact.width}px`,
    "--cover-inline-wide": `${wide.width}px`,
  };
}

export function BookCover({
  book,
  decorative = false,
  priority = false,
  variant,
}: BookCoverProps) {
  const coverStyle = getCoverStyle(book, variant);
  const isShelfPlaceholder = variant === "shelf" && !book.coverImageUrl;

  return (
    <div
      aria-hidden={decorative || undefined}
      className={`book-cover book-cover--${variant}`}
      style={coverStyle}
    >
      {book.coverImageUrl ? (
        <Image
          alt={decorative ? "" : `${book.title}の書影`}
          className="book-cover__image"
          fill
          priority={priority}
          sizes={sizesByVariant[variant]}
          src={book.coverImageUrl}
        />
      ) : (
        <div
          aria-hidden={decorative || undefined}
          aria-label={decorative ? undefined : `${book.title}の書影`}
          className="book-cover__placeholder"
          role={decorative ? undefined : "img"}
        >
          {isShelfPlaceholder ? (
            <span>書影なし</span>
          ) : (
            <>
              {book.isbn && <span>ISBN {book.isbn}</span>}
              <i />
              <i />
              <strong>Stack Library</strong>
            </>
          )}
        </div>
      )}
    </div>
  );
}
