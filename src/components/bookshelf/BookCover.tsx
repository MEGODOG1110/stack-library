"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./BookCover.module.css";

export function BookCover({ src }: { src: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  const failed = failedSource === src;

  return (
    <span className={styles["SL-el_book-cover"]} data-state={failed ? "error" : "ready"}>
      {failed ? (
        <span className={styles["SL-el_book-cover__error"]} role="img" aria-label="書影を表示できません">
          書影を表示<br />できません
        </span>
      ) : (
        <Image src={src} alt="" width={104} height={157} unoptimized onError={() => setFailedSource(src)} />
      )}
    </span>
  );
}
