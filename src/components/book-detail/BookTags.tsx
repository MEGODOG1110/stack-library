import styles from "./BookTags.module.css";

export function BookTags({ tags }: { tags: readonly { id: string; label: string }[] }) {
  return tags.length ? <ul className={styles["SL-el_book-tags"]} aria-label="技術タグ">
    {tags.map((tag) => <li key={tag.id}>{tag.label}</li>)}
  </ul> : <p className={styles["SL-el_book-tags__message"]}>未登録</p>;
}
