"use client";

import Image from "next/image";
import { useState } from "react";
import { NoImage } from "./NoImage";
import styles from "./BookCover.module.css";

export function BookCover({ src, size = "shelf" }: { src: string; size?: "shelf" | "detail" }) {
  const [failedSource, setFailedSource] = useState<string>();
  const failed = failedSource === src;

  return (
    <span className={styles["SL-el_book-cover"]} data-size={size} data-state={failed ? "error" : "ready"}>
      {failed ? (
        <NoImage size={size} />
      ) : (
        <Image src={src} alt="" width={104} height={157} loading={size === "detail" ? "eager" : undefined} unoptimized onError={() => setFailedSource(src)} />
      )}
    </span>
  );
}
