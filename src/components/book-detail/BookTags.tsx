import tagStyles from "../bookshelf/SearchTermTag.module.css";
import styles from "./BookTags.module.css";

export function BookTags({ tags }: { tags: readonly { id: string; label: string }[] }) {
  return tags.length ? <ul className={tagStyles["SL-ly_search-term-tags"]} aria-label="検索語">
    {tags.map((tag) => <li key={tag.id}><span className={tagStyles["SL-el_search-term-tag"]}><span>{tag.label}</span></span></li>)}
  </ul> : <p className={styles["SL-el_book-tags__message"]}>未登録</p>;
}
