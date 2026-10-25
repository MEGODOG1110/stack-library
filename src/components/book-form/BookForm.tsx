"use client";
import { useId, useRef, useState } from "react";
import { CoverPicker } from "./CoverPicker";
import { FormField } from "./FormField";
import { bookAreas } from "@/lib/books/classification";
import { TagSelector } from "./TagSelector";
import { checkBookInput, emptyBookDraft } from "./book-form.validation";
import type { BookFormDraft, BookFormErrors, CheckedBookInput, FormTag } from "./book-form.types";
import styles from "./BookForm.module.css";

export function BookForm({ initialValues, onDirtyChange, onCheck, initialCoverSrc, confirmLabel = "入力内容を確認" }: {
  tags: readonly FormTag[]; initialValues?: Partial<BookFormDraft>; onDirtyChange?: (dirty: boolean) => void; onCheck?: (value: CheckedBookInput) => void; initialCoverSrc?: string; confirmLabel?: string;
}) {
  const prefix = useId();
  const form = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<BookFormDraft>(() => ({ ...emptyBookDraft, ...initialValues, areaIds: [...(initialValues?.areaIds ?? [])] }));
  const [cover, setCover] = useState<File | string>();
  const [errors, setErrors] = useState<BookFormErrors>({});
  const [checked, setChecked] = useState(false);
  function dirty() { onDirtyChange?.(true); setChecked(false); }
  function update(key: keyof BookFormDraft, value: string | string[]) {
    dirty(); setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  const field = (key: "title" | "authors" | "isbn" | "publisher" | "price" | "keywords", label: string, options: { required?: boolean; hint?: string; multiline?: boolean; inputMode?: "numeric" | "decimal"; placeholder?: string } = {}) =>
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
          {field("isbn", "ISBN", { required: true, inputMode: "numeric", hint: "13桁のISBNを入力してください。ハイフン・全角数字も使えます。" })}
          {field("publisher", "出版社")}
          <TagSelector label="分野（任意）" options={bookAreas} selected={draft.areaIds} onChange={(ids) => update("areaIds", ids)} />
          {field("keywords", "検索語（任意）", { multiline: true, hint: "React・CSSなど、探すときの言葉を1行に1つ入力できます。空欄でも登録できます。" })}
        </div>
        <div className={styles["SL-ly_book-form__column"]}>
          <CoverPicker id={`${prefix}-cover`} initialSrc={initialCoverSrc} error={errors.cover} onDirty={dirty} onChange={(file) => { setCover(file); setChecked(false); if (file) setErrors((current) => ({ ...current, cover: undefined })); }} />
          {field("price", "税込価格", { inputMode: "decimal", hint: "任意。空欄の価格は集計しません。0円も入力できます。" })}
        </div>
      </div>
    </div>
    <footer className={styles["SL-ly_book-form__footer"]}>
      {checked && <p role="status">入力内容を確認しました。保存はまだ行っていません。</p>}
      <button type="submit">{confirmLabel}</button>
    </footer>
  </form>;
}
