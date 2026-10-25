"use client";
import { useId, useRef, useState } from "react";
import { CoverPicker } from "./CoverPicker";
import { FormField } from "./FormField";
import { TagSelector } from "./TagSelector";
import { checkBookInput, emptyBookDraft } from "./book-form.validation";
import type { BookFormDraft, BookFormErrors, CheckedBookInput, FormTag } from "./book-form.types";
import styles from "./BookForm.module.css";

export function BookForm({ tags, initialValues, onDirtyChange, onCheck }: {
  tags: readonly FormTag[]; initialValues?: Partial<BookFormDraft>; onDirtyChange?: (dirty: boolean) => void; onCheck?: (value: CheckedBookInput) => void;
}) {
  const prefix = useId();
  const form = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<BookFormDraft>(() => ({ ...emptyBookDraft, ...initialValues, tagIds: [...(initialValues?.tagIds ?? [])] }));
  const [cover, setCover] = useState<File>();
  const [errors, setErrors] = useState<BookFormErrors>({});
  const [checked, setChecked] = useState(false);
  function dirty() { onDirtyChange?.(true); setChecked(false); }
  function update(key: keyof BookFormDraft, value: string | string[]) {
    dirty(); setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  const field = (key: "title" | "authors" | "isbn" | "publisher" | "editionPublicationText" | "price", label: string, options: { required?: boolean; hint?: string; multiline?: boolean; inputMode?: "numeric" | "decimal"; placeholder?: string } = {}) =>
    <FormField id={`${prefix}-${key}`} name={key} label={label} value={draft[key]} onChange={(value) => update(key, value)} error={errors[key as keyof BookFormErrors]} {...options} />;
  return <form ref={form} className={styles["SL-ly_book-form"]} noValidate onSubmit={(event) => {
    event.preventDefault(); const result = checkBookInput(draft, cover); setErrors(result.errors); setChecked(false);
    if (!result.value) {
      const first = Object.keys(result.errors)[0];
      (form.current?.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    onCheck?.(result.value); setChecked(true);
  }}>
    <div className={styles["SL-ly_book-form__viewport"]}>
      <p className={styles["SL-el_book-form__notice"]}>入力確認用です。書籍・画像はまだ保存されません。</p>
      {Object.values(errors).some(Boolean) && <p role="alert" className={styles["SL-el_book-form__error"]}>入力内容を確認してください。入力した内容は保持しています。</p>}
      <div className={styles["SL-ly_book-form__columns"]}>
        <div className={styles["SL-ly_book-form__column"]}>
          {field("title", "書名", { required: true })}
          {field("authors", "著者", { required: true, multiline: true, hint: "複数名は改行して入力できます。編者・団体名も入力できます。" })}
          {field("isbn", "ISBN", { inputMode: "numeric", hint: "任意。13桁のISBNを入力してください。ハイフンも使えます。" })}
          {field("publisher", "出版社")}
          {field("editionPublicationText", "版・出版年", { placeholder: "第2版 / 2026年" })}
          <TagSelector options={tags} selected={draft.tagIds} onChange={(ids) => update("tagIds", ids)} />
        </div>
        <div className={styles["SL-ly_book-form__column"]}>
          <CoverPicker id={`${prefix}-cover`} error={errors.cover} onDirty={dirty} onChange={(file) => { setCover(file); setChecked(false); if (file) setErrors((current) => ({ ...current, cover: undefined })); }} />
          {field("price", "税込価格", { inputMode: "decimal", hint: "任意。空欄の価格は集計しません。0円も入力できます。" })}
        </div>
      </div>
    </div>
    <footer className={styles["SL-ly_book-form__footer"]}>
      {checked && <p role="status">入力内容を確認しました。保存はまだ行っていません。</p>}
      <button type="submit">入力内容を確認</button>
    </footer>
  </form>;
}
