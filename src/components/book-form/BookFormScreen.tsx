"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { BookForm } from "./BookForm";
import type { BookFormDraft, FormTag } from "./book-form.types";
import styles from "./BookFormScreen.module.css";

export function BookFormScreen({ tags, initialValues, onExit, children, hasUnsavedChanges = false }: { tags: readonly FormTag[]; initialValues?: Partial<BookFormDraft>; onExit?: (href: string) => void; children?: ReactNode; hasUnsavedChanges?: boolean }) {
  const [localDirty, setDirty] = useState(false);
  const dirty = localDirty || hasUnsavedChanges;
  const dialog = useRef<HTMLDialogElement>(null);
  const destination = useRef("/");
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (dirty) { event.preventDefault(); destination.current = href; dialog.current?.showModal(); }
    else if (onExit) { event.preventDefault(); onExit(href); }
  }
  return <div className={styles["SL-ly_book-form-screen"]}>
    <nav className={styles["SL-ly_book-form-screen__navigation"]} aria-label="メインナビゲーション">
      <Link href="/" onClick={(event) => navigate(event, "/")}><Image src="/mockups/bookshelf/desktop/home.svg" width={20} height={20} alt="" unoptimized />本棚</Link>
      <Link href="/?view=search" onClick={(event) => navigate(event, "/?view=search")}><Image src="/mockups/bookshelf/desktop/search.svg" width={20} height={20} alt="" unoptimized />検索</Link>
      <span aria-current="page"><Image src="/mockups/bookshelf/desktop/add.svg" width={20} height={20} alt="" unoptimized />追加</span>
      <button disabled><Image src="/mockups/bookshelf/desktop/price.svg" width={20} height={20} alt="" unoptimized /><span>金額<small>準備中</small></span></button>
    </nav>
    <header className={styles["SL-ly_book-form-screen__header"]}>
      <Link href="/" aria-label="本棚に戻る" onClick={(event) => navigate(event, "/")}><Image src="/mockups/bookshelf/back.svg" width={20} height={20} alt="" unoptimized /></Link><h1>本を追加</h1>
    </header>
    {children ?? <BookForm tags={tags} initialValues={initialValues} onDirtyChange={setDirty} />}
    <dialog ref={dialog} className={styles["SL-el_book-form-screen__dialog"]} aria-labelledby="form-leave-title">
      <h2 id="form-leave-title">入力内容を破棄しますか？</h2><p>入力内容と選択した画像は保存されません。</p>
      <button type="button" autoFocus onClick={() => dialog.current?.close()}>入力を続ける</button>
      <button type="button" onClick={() => { dialog.current?.close(); setDirty(false); if (onExit) onExit(destination.current); else window.location.assign(destination.current); }}>破棄して戻る</button>
    </dialog>
  </div>;
}
