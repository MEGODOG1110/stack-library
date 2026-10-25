import type { FormTag } from "./book-form.types";
import styles from "./TagSelector.module.css";
export function TagSelector({ options, selected, onChange }: { options: readonly FormTag[]; selected: readonly string[]; onChange: (ids: string[]) => void }) {
  return <fieldset className={styles["SL-el_tag-selector"]}><legend>技術タグ</legend>
    <div>{options.map((tag) => <label key={tag.id}><input type="checkbox" checked={selected.includes(tag.id)} onChange={() => onChange(selected.includes(tag.id) ? selected.filter((id) => id !== tag.id) : [...selected, tag.id])} />{tag.label}</label>)}</div>
  </fieldset>;
}
