"use client";

import Image from "next/image";
import { type CSSProperties, useState, ViewTransition } from "react";
import { NoImage } from "./NoImage";
import styles from "./BookCover.module.css";

// Reuse the loaded image ratio when the same cover mounts on the detail route.
const coverRatios = new Map<string, number>();

export function BookCover({ src, size = "shelf", transitionBookId }: {
  src: string;
  size?: "shelf" | "detail";
  transitionBookId?: string;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const [loadedRatio, setLoadedRatio] = useState<{ src: string; value: number }>();
  const failed = failedSource === src;
  const ratio = transitionBookId && !failed
    ? (loadedRatio?.src === src ? loadedRatio.value : coverRatios.get(src))
    : undefined;

  const image = (
    <Image
      src={src}
      alt=""
      width={104}
      height={157}
      loading={size === "detail" ? "eager" : undefined}
      unoptimized
      onLoad={({ currentTarget }) => {
        if (!transitionBookId || !currentTarget.naturalHeight) return;
        const value = currentTarget.naturalWidth / currentTarget.naturalHeight;
        coverRatios.set(src, value);
        if (value !== ratio) setLoadedRatio({ src, value });
      }}
      onError={() => setFailedSource(src)}
    />
  );

  return (
    <span
      className={styles["SL-el_book-cover"]}
      data-size={size}
      data-state={failed ? "error" : "ready"}
      style={ratio ? { "--sl-cover-ratio": ratio } as CSSProperties : undefined}
      data-fitted={ratio ? "" : undefined}
    >
      {failed ? <NoImage size={size} /> : transitionBookId ? (
        <ViewTransition
          name={`book-cover-${transitionBookId}`}
          default="none"
          share={ratio ? { "book-detail": "sl-book-cover-motion", default: "none" } : "none"}
        >
          {image}
        </ViewTransition>
      ) : image}
    </span>
  );
}
