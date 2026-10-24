import type { ReactNode } from "react";
import styles from "./BookMetadata.module.css";

export function BookMetadata({ items }: { items: readonly { label: string; value?: ReactNode }[] }) {
  return <dl className={styles["SL-el_book-meta"]}>{items.map(({ label, value }) =>
    <div key={label} className={styles["SL-el_book-meta__record"]}>
      <dt>{label}</dt><dd>{value === undefined || value === null || value === "" ? "未登録" : value}</dd>
    </div>,
  )}</dl>;
}
