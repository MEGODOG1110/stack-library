"use client";
import { bookAreas } from "@/lib/books/classification";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { BookFormScreen } from "./BookFormScreen";
import { BookForm } from "./BookForm";
import { FormField } from "./FormField";
import { NoImage } from "../bookshelf/NoImage";
import { BookMetadata } from "../book-detail/BookMetadata";
import { isValidIsbn, normalizeIsbn } from "./book-form.validation";
import type { CheckedBookInput, FormTag } from "./book-form.types";
import type { IsbnLookup, OwnedBook, RegisterBook } from "./isbn-registration.types";
import styles from "./IsbnRegistration.module.css";

type Stage = "isbn" | "loading" | "not-found" | "lookup-error" | "manual" | "preview" | "registering" | "complete";
const titleKey = (title: string) => title.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ja");

export function IsbnRegistration({ lookup, register, ownedBooks = [], tags, onExit, sampleRegistration = true, notice = "画面確認用です。補完・登録はサンプル処理で、実際には保存されません。" }: {
  lookup: IsbnLookup; register?: RegisterBook; ownedBooks?: readonly OwnedBook[]; tags: readonly FormTag[]; onExit?: (href: string) => void; notice?: string; sampleRegistration?: boolean;
}) {
  const isbnId = useId();
  const [isbn, setIsbn] = useState("");
  const [isbnError, setIsbnError] = useState("");
  const [stage, setStage] = useState<Stage>("isbn");
  const [book, setBook] = useState<CheckedBookInput>();
  const [previewSrc, setPreviewSrc] = useState("");
  const [coverReady, setCoverReady] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [titleAccepted, setTitleAccepted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const controller = useRef<AbortController | undefined>(undefined);
  const request = useRef(0);
  const ownedPreviewUrl = useRef<string | undefined>(undefined);
  const active = useRef(true);
  const saving = useRef(false);
  const [registrationUnknown, setRegistrationUnknown] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; controller.current?.abort(); if (ownedPreviewUrl.current) URL.revokeObjectURL(ownedPreviewUrl.current); }; }, []);
  useEffect(() => { if (stage !== "loading" && stage !== "registering") heading.current?.focus(); }, [stage]);
  useEffect(() => { if (saveError) errorSummary.current?.focus(); }, [saveError]);
  const existing = book?.isbn ? ownedBooks.find((item) => item.isbn && normalizeIsbn(item.isbn) === book.isbn) : undefined;
  const sameTitle = book && ownedBooks.some((item) => titleKey(item.title) === titleKey(book.title));

  function showPreview(value: CheckedBookInput) {
    if (value.cover === ownedPreviewUrl.current && book?.cover instanceof File) value = { ...value, cover: book.cover };
    const src = typeof value.cover === "string" ? value.cover : URL.createObjectURL(value.cover);
    if (ownedPreviewUrl.current && ownedPreviewUrl.current !== src) URL.revokeObjectURL(ownedPreviewUrl.current);
    ownedPreviewUrl.current = typeof value.cover !== "string" || ownedPreviewUrl.current === src ? src : undefined;
    setBook(value); setPreviewSrc(src); setCoverReady(false); setCoverFailed(false); setTitleAccepted(false); setSaveError(""); setStage("preview");
  }
  async function fetchBook() {
    const canonical = normalizeIsbn(isbn);
    if (!isValidIsbn(canonical)) { setIsbnError("ISBNは正しい13桁の番号を入力してください"); return; }
    controller.current?.abort(); const current = ++request.current;
    const abort = new AbortController(); controller.current = abort;
    setIsbnError(""); setStage("loading"); setDirty(true);
    try {
      const result = await lookup(canonical, abort.signal);
      if (!active.current || abort.signal.aborted || current !== request.current) return;
      if (result.status === "not-found") { setBook(undefined); setStage("not-found"); return; }
      // 別のISBNの結果を誤って登録候補にしない。
      if (normalizeIsbn(result.book.isbn) !== canonical) throw new Error("ISBN mismatch");
      setPriceNote(result.book.priceNote ?? "");
      showPreview({ title: result.book.title, authors: [...result.book.authors], isbn: canonical, publisher: result.book.publisher, areaIds: [], keywords: "", registeredPrice: result.book.registeredPrice, cover: result.book.coverSrc ?? "" });
    } catch {
      if (active.current && !abort.signal.aborted && current === request.current) setStage("lookup-error");
    }
  }
  function cancelLookup() { ++request.current; controller.current?.abort(); setStage("isbn"); }
  async function submit() {
    if (!book || !register || saving.current || registrationUnknown || existing || !coverReady || !book.title.trim() || !book.authors.some((name) => name.trim()) || (sameTitle && !titleAccepted)) return;
    saving.current = true; setSaveError(""); setStage("registering");
    try { await register(book); if (active.current) { setDirty(false); setStage("complete"); } }
    catch (error) { if (active.current) { const message = !sampleRegistration && error instanceof Error ? error.message : "登録できませんでした。確認した内容を保持しています。"; setRegistrationUnknown(message.includes("再登録しない")); setSaveError(message); setStage("preview"); } }
    finally { saving.current = false; }
  }
  const previewing = stage === "preview" || stage === "registering";
  const editable = book ? { title: book.title, authors: book.authors.join("\n"), isbn: book.isbn ?? "", publisher: book.publisher ?? "", areaIds: book.areaIds, keywords: book.keywords, price: book.registeredPrice === undefined ? "" : String(book.registeredPrice) } : { isbn };
  return <BookFormScreen tags={tags} onExit={onExit} hasUnsavedChanges={dirty}>
    <div className={styles["SL-ly_isbn-registration"]}>
      <ol className={styles["SL-ly_isbn-registration__steps"]} aria-label="登録手順"><li aria-current={stage === "isbn" || stage === "loading" ? "step" : undefined}>ISBN入力</li><li aria-current={previewing || stage === "manual" ? "step" : undefined}>補完・プレビュー</li><li aria-current={stage === "complete" ? "step" : undefined}>登録</li></ol>
      <p className={styles["SL-el_isbn-registration__notice"]}>{notice}</p>
      {stage === "manual" ? <><h2 ref={heading} tabIndex={-1}>不足情報の入力・修正</h2><button type="button" onClick={() => book ? setStage("preview") : setStage("isbn")}>前の画面に戻る</button><BookForm tags={tags} initialValues={editable} initialCoverSrc={previewSrc || undefined} confirmLabel="プレビューへ" onDirtyChange={setDirty} onCheck={(value) => { setPriceNote(""); showPreview(value); }} /></> : <div className={styles["SL-ly_isbn-registration__viewport"]}>
        {!previewing && stage !== "complete" && <>
          <h2 ref={heading} tabIndex={-1}>ISBNから本を追加</h2>
          <form onSubmit={(event) => { event.preventDefault(); void fetchBook(); }}>
            <fieldset disabled={stage === "loading"}>
              <FormField id={isbnId} name="isbn" label="ISBN" value={isbn} inputMode="numeric" onChange={(value) => { setIsbn(value); setIsbnError(""); setDirty(!!value); setStage("isbn"); setBook(undefined); }} hint="13桁の番号を入力してください。ハイフン・全角数字も使えます。" error={isbnError} />
              <button type="submit">本の情報を取得</button>
            </fieldset>
          </form>
          {stage === "loading" && <div role="status"><p>本の情報を取得しています</p><button type="button" onClick={cancelLookup}>取得を中止</button></div>}
          {stage === "not-found" && <p role="status">このISBNの情報が見つかりませんでした。ISBNを確認するか、手入力できます。</p>}
          {stage === "lookup-error" && <p role="alert">情報を取得できませんでした。同じISBNで再試行するか、手入力できます。</p>}
          {stage !== "loading" && <button type="button" onClick={() => { setBook(undefined); setPreviewSrc(""); setStage("manual"); }}>情報を取得できない場合は手入力</button>}
        </>}
        {previewing && book && <>
          <h2 ref={heading} tabIndex={-1}>この本で間違いありませんか？</h2>
          <div className={styles["SL-ly_isbn-registration__identity"]}>
            <div className={styles["SL-el_isbn-registration__cover"]}>{previewSrc && !coverFailed ? <Image key={previewSrc} src={previewSrc} width={104} height={157} alt="補完された表紙画像" loading="eager" unoptimized onLoad={() => setCoverReady(true)} onError={() => { setCoverFailed(true); setCoverReady(false); }} /> : <NoImage size="detail" />}</div>
            <div><h3>{book.title || "書名を補完できませんでした"}</h3><BookMetadata items={[{ label: "著者", value: book.authors.join("・") }, { label: "ISBN", value: book.isbn }, { label: "出版社", value: book.publisher }, { label: "分野", value: bookAreas.filter(area=>book.areaIds.includes(area.id)).map(area=>area.label).join("・") || undefined }, { label: "検索語", value: book.keywords || undefined }, { label: "税込価格", value: book.registeredPrice === undefined ? undefined : `${book.registeredPrice}円` }]} /></div>
          </div>
          {priceNote && <p>{priceNote}</p>}
          {(!book.title.trim() || !book.authors.some((name) => name.trim()) || !previewSrc || coverFailed) && <div role="alert"><p>登録に必要な情報を補ってください。</p><ul>
            {!book.title.trim() && <li>書名：取得できませんでした。書名を入力してください。</li>}
            {!book.authors.some(name => name.trim()) && <li>著者：取得できませんでした。著者を1名以上入力してください。</li>}
            {!previewSrc && <li>表紙画像：取得できませんでした。画像ファイルを選択してください。</li>}
            {previewSrc && coverFailed && <li>表紙画像：読み込みに失敗しました。画像を選び直してください。</li>}
          </ul><p>「不足情報の入力・修正」から補えます。出版社・価格・分野・検索語は未入力でも登録できます。ISBNは必須です。</p></div>}
          {previewSrc && !coverReady && !coverFailed && <p role="status">表紙画像を読み込んでいます。読み込み完了後に登録できます。</p>}
          {existing ? <p role="alert">このISBNの本は登録済みです。<Link href={`/books/${encodeURIComponent(normalizeIsbn(existing.isbn ?? ""))}`}>登録済みの書籍を見る</Link></p> : sameTitle && <label><input type="checkbox" checked={titleAccepted} disabled={stage === "registering"} onChange={(event) => setTitleAccepted(event.target.checked)} />同じ書名の本があります。内容を確認したうえで続ける</label>}
          {saveError && <div ref={errorSummary} tabIndex={-1} role="alert"><strong>登録できませんでした</strong><p>{saveError}</p></div>}
          <div className={styles["SL-ly_isbn-registration__actions"]}>
            <button type="button" disabled={stage === "registering"} onClick={() => setStage("manual")}>不足情報の入力・修正</button>
            <button type="button" disabled={stage === "registering"} onClick={() => setStage("isbn")}>ISBNを入力し直す</button>
            <button type="button" disabled={registrationUnknown || !register || !!existing || !coverReady || !book.title.trim() || !book.authors.some((name) => name.trim()) || (sameTitle && !titleAccepted) || stage === "registering"} onClick={() => void submit()}>{stage === "registering" ? (sampleRegistration ? "登録しています（サンプル）" : "書影と書籍を保存しています") : register ? (sampleRegistration ? "登録する（サンプル）" : "登録する") : "登録する（保存未接続）"}</button>
          </div>
        </>}
        {stage === "complete" && <><h2 ref={heading} tabIndex={-1}>{sampleRegistration ? "登録完了（サンプル）" : "登録しました"}</h2><p role="status">{sampleRegistration ? "登録処理の成功表示です。実際の蔵書は保存・変更していません。" : "microCMSへの保存と読戻しを確認しました。"}</p>{!sampleRegistration && book?.isbn && <Link href={`/books/${normalizeIsbn(book.isbn)}`}>登録した本を見る</Link>}<button type="button" onClick={() => { setIsbn(""); setBook(undefined); setStage("isbn"); }}>続けて本を追加</button></>}
      </div>}
    </div>
  </BookFormScreen>;
}
