"use client";

import { bookAreas } from "@/lib/books/classification";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { BookFormScreen } from "./BookFormScreen";
import { BookForm } from "./BookForm";
import { FormField } from "./FormField";
import { validateCoverFile } from "./CoverPicker";
import { BookMetadata } from "../book-detail/BookMetadata";
import { isValidIsbn, normalizeIsbn } from "./book-form.validation";
import type { CheckedBookInput, FormTag } from "./book-form.types";
import type { IsbnLookup, OwnedBook, PublisherCover, RegisterBook, RegisteredBook } from "./isbn-registration.types";
import styles from "./IsbnRegistration.module.css";

type Stage = "isbn" | "loading" | "not-found" | "lookup-error" | "manual" | "preview" | "registered" | "registering" | "complete";
const titleKey = (title: string) => title.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ja");
const steps = ["ISBN入力", "確認", "登録完了"];

function RegistrationSteps({ current }: { current: number }) {
  return (
    <ol className={styles["SL-ly_isbn-registration__steps"]} aria-label="登録手順">
      {steps.map((step, index) => (
        <li key={step} aria-current={index === current ? "step" : undefined} data-step={index < current ? "complete" : index === current ? "current" : "pending"}>
          <span className={styles["SL-el_isbn-registration__marker"]} aria-hidden="true">
            {index < current ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 9L7.5 13.5L15 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : index + 1}
          </span>
          <span>{step}{index < current && <span className={styles["SL-ut_visually-hidden"]}>（完了）</span>}</span>
        </li>
      ))}
    </ol>
  );
}

function RegistrationIdentity({ title, subtitle, authors }: {
  title: string; subtitle?: string; authors: readonly string[];
}) {
  return (
    <div className={styles["SL-ly_isbn-registration__identity"]}>
      <div className={styles["SL-ly_isbn-registration__titles"]}>
        <h3>{title || "書名を補完できませんでした"}</h3>
        {subtitle && <p className={styles["SL-el_isbn-registration__subtitle"]}>{subtitle}</p>}
      </div>
      {authors.length > 0 && <p className={styles["SL-el_isbn-registration__authors"]}>{authors.join("・")}</p>}
    </div>
  );
}

export function IsbnRegistration({ lookup, register, ownedBooks = [], tags, onExit, sampleRegistration = true, notice = "画面確認用です。補完・登録はサンプル処理で、実際には保存されません。" }: {
  lookup: IsbnLookup; register?: RegisterBook; ownedBooks?: readonly OwnedBook[]; tags: readonly FormTag[]; onExit?: (href: string) => void; sampleRegistration?: boolean; notice?: string;
}) {
  const isbnId = useId();
  const [isbn, setIsbn] = useState("");
  const [isbnError, setIsbnError] = useState("");
  const [stage, setStage] = useState<Stage>("isbn");
  const [book, setBook] = useState<CheckedBookInput>();
  const [registered, setRegistered] = useState<RegisteredBook>();
  const [previewSrc, setPreviewSrc] = useState("");
  const [coverReady, setCoverReady] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [publisherCover, setPublisherCover] = useState<PublisherCover>();
  const [candidateReady, setCandidateReady] = useState(false);
  const [candidateFailed, setCandidateFailed] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [titleAccepted, setTitleAccepted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [registrationUnknown, setRegistrationUnknown] = useState(false);
  const controller = useRef<AbortController | undefined>(undefined);
  const request = useRef(0);
  const ownedPreviewUrl = useRef<string | undefined>(undefined);
  const active = useRef(true);
  const saving = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const previewing = stage === "preview" || stage === "registering";
  const missingCover = !previewSrc || coverFailed;
  const candidate = missingCover && !candidateFailed ? publisherCover?.src : undefined;
  const previewHeading = previewing
    ? candidate ? "書影を選んでください" : missingCover ? "書影を追加してください" : "この本を登録しますか？"
    : undefined;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controller.current?.abort();
      if (ownedPreviewUrl.current) URL.revokeObjectURL(ownedPreviewUrl.current);
    };
  }, []);
  useEffect(() => {
    if (stage === "loading" || stage === "registering") return;
    if (heading.current) heading.current.focus();
    else document.getElementById(isbnId)?.focus();
  }, [isbnId, previewHeading, stage]);
  useEffect(() => { if (saveError) errorSummary.current?.focus(); }, [saveError]);

  const existing = book?.isbn ? ownedBooks.find(item => item.isbn && normalizeIsbn(item.isbn) === book.isbn) : undefined;
  const sameTitle = book && ownedBooks.some(item => titleKey(item.title) === titleKey(book.title));
  const loading = stage === "loading";
  const inputStage = stage === "isbn" || loading || stage === "not-found" || stage === "lookup-error";

  function clearPreview() {
    if (ownedPreviewUrl.current) URL.revokeObjectURL(ownedPreviewUrl.current);
    ownedPreviewUrl.current = undefined;
    setBook(undefined);
    setRegistered(undefined);
    setPreviewSrc("");
    setCoverError("");
    setPublisherCover(undefined);
    setCandidateReady(false);
    setCandidateFailed(false);
    setSaveError("");
    setPriceNote("");
  }

  function showPreview(value: CheckedBookInput) {
    if (value.cover === ownedPreviewUrl.current && book?.cover instanceof File) value = { ...value, cover: book.cover };
    const src = typeof value.cover === "string" ? value.cover : URL.createObjectURL(value.cover);
    if (ownedPreviewUrl.current && ownedPreviewUrl.current !== src) URL.revokeObjectURL(ownedPreviewUrl.current);
    ownedPreviewUrl.current = typeof value.cover !== "string" || ownedPreviewUrl.current === src ? src : undefined;
    setBook(value);
    setPreviewSrc(src);
    if (src !== previewSrc || coverFailed) {
      setCoverReady(false);
      setCoverFailed(false);
    }
    setCoverError("");
    setTitleAccepted(false);
    setSaveError("");
    setStage("preview");
  }

  async function fetchBook() {
    const canonical = normalizeIsbn(isbn);
    if (!isValidIsbn(canonical)) { setIsbnError("ISBNは正しい13桁の番号を入力してください"); document.getElementById(isbnId)?.focus(); return; }
    controller.current?.abort();
    const current = ++request.current;
    const abort = new AbortController();
    controller.current = abort;
    setIsbnError("");
    setStage("loading");
    setDirty(true);
    try {
      const result = await lookup(canonical, abort.signal);
      if (!active.current || abort.signal.aborted || current !== request.current) return;
      if (result.status === "not-found") { clearPreview(); setStage("not-found"); return; }
      if (normalizeIsbn(result.book.isbn) !== canonical) throw new Error("ISBN mismatch");
      if (result.status === "registered") {
        clearPreview();
        setRegistered(result.book);
        setDirty(false);
        setStage("registered");
        return;
      }
      setPriceNote(result.book.priceNote ?? "");
      setPublisherCover(result.book.publisherCover);
      setCandidateReady(false);
      setCandidateFailed(false);
      showPreview({ title: result.book.title, subtitle: result.book.subtitle, authors: [...result.book.authors], isbn: canonical, publisher: result.book.publisher, areaIds: [], keywords: "", registeredPrice: result.book.registeredPrice, cover: result.book.coverSrc ?? "" });
    } catch {
      if (active.current && !abort.signal.aborted && current === request.current) setStage("lookup-error");
    }
  }

  function cancelLookup() {
    ++request.current;
    controller.current?.abort();
    setStage("isbn");
  }

  function restart(clearIsbn = false) {
    clearPreview();
    if (clearIsbn) setIsbn("");
    setIsbnError("");
    setRegistrationUnknown(false);
    setDirty(!clearIsbn && !!isbn);
    setStage("isbn");
  }

  async function submit() {
    if (!book || !register || saving.current || registrationUnknown || existing || !coverReady || !book.title.trim() || !book.authors.some(name => name.trim()) || (sameTitle && !titleAccepted)) return;
    saving.current = true;
    setSaveError("");
    setStage("registering");
    try {
      await register(book);
      if (active.current) { setDirty(false); setStage("complete"); }
    } catch (error) {
      if (active.current) {
        const message = !sampleRegistration && error instanceof Error ? error.message : "登録できませんでした。確認した内容を保持しています。";
        setRegistrationUnknown(message.includes("再登録しない"));
        setSaveError(message);
        setStage("preview");
      }
    } finally {
      saving.current = false;
    }
  }

  const editable = book ? { title: book.title, subtitle: book.subtitle ?? "", authors: book.authors.join("\n"), isbn: book.isbn, publisher: book.publisher ?? "", areaIds: book.areaIds, keywords: book.keywords, price: book.registeredPrice === undefined ? "" : String(book.registeredPrice) } : { isbn };

  return (
    <BookFormScreen tags={tags} onExit={onExit} hasUnsavedChanges={dirty}>
      <div className={styles["SL-ly_isbn-registration"]}>
        <RegistrationSteps current={stage === "complete" ? 3 : inputStage ? 0 : 1} />
        {notice && <p className={styles["SL-el_isbn-registration__notice"]}>{notice}</p>}
        <div className={styles["SL-ly_isbn-registration__viewport"]} data-layout={inputStage ? "isbn" : stage === "manual" ? "manual" : "summary"}>
          {inputStage && (
            <form noValidate aria-label="ISBN入力" className={styles["SL-ly_isbn-registration__isbn-form"]} onSubmit={event => { event.preventDefault(); void fetchBook(); }}>
              <fieldset disabled={loading}>
                <FormField id={isbnId} name="isbn" label="ISBN" required value={isbn} inputMode="numeric" placeholder="例 9784297111731" onChange={value => { setIsbn(value); setIsbnError(""); setDirty(!!value); setStage("isbn"); }} hint="13桁のISBNを入力してください。ハイフン・全角数字も使えます。" error={isbnError} />
              </fieldset>
              {stage === "not-found" && <p role="status">このISBNの情報が見つかりませんでした。ISBNを確認するか、手入力できます。</p>}
              {stage === "lookup-error" && <p role="alert">情報を取得できませんでした。同じISBNで再試行するか、手入力できます。</p>}
              <div className={styles["SL-ly_isbn-registration__isbn-actions"]}>
                <button type="submit" disabled={loading} data-variant="primary">{loading ? "取得中…" : "本の情報を取得"}</button>
                {loading
                  ? <button type="button" data-variant="secondary" onClick={cancelLookup}>取得を中止</button>
                  : <button type="button" data-variant="secondary" onClick={() => { clearPreview(); setStage("manual"); }}>手入力で追加</button>}
              </div>
              <span className={styles["SL-ut_visually-hidden"]} aria-live="polite">{loading ? "本の情報を取得しています" : ""}</span>
            </form>
          )}
          {stage === "manual" && (
            <>
              <h2 ref={heading} tabIndex={-1}>{book ? "書籍情報を修正" : "書誌情報を入力"}</h2>
              <BookForm
                tags={tags}
                initialValues={editable}
                initialCoverSrc={previewSrc && !coverFailed ? previewSrc : undefined}
                confirmLabel="プレビューへ"
                backAction={{
                  label: book ? "修正せず確認に戻る" : "ISBN入力に戻る",
                  onClick: () => setStage(book ? "preview" : "isbn"),
                }}
                onDirtyChange={setDirty}
                onCheck={value => { setIsbn(value.isbn); setPriceNote(""); showPreview(value); }}
              />
            </>
          )}
          {previewing && book && (
            <>
              <h2 ref={heading} tabIndex={-1}>{previewHeading}</h2>
              <div className={styles["SL-ly_isbn-registration__preview"]}>
                <div className={styles["SL-el_isbn-registration__cover"]}>
                  {!missingCover ? (
                    <Image key={previewSrc} src={previewSrc} width={144} height={182} alt="書籍の表紙" loading="eager" unoptimized onLoad={() => setCoverReady(true)} onError={() => { setCoverFailed(true); setCoverReady(false); if (previewSrc === publisherCover?.src) setCandidateFailed(true); }} />
                  ) : candidate ? (
                    <Image key={`candidate:${candidate}`} src={candidate} width={144} height={182} alt="出版社の書影候補" loading="eager" unoptimized onLoad={() => setCandidateReady(true)} onError={() => setCandidateFailed(true)} />
                  ) : <span className={styles["SL-el_isbn-registration__no-cover"]}>書影なし</span>}
                </div>
                <RegistrationIdentity {...book} />
                <div className={styles["SL-ly_isbn-registration__metadata"]}>
                  <BookMetadata items={[
                    { label: "ISBN", value: book.isbn },
                    { label: "出版社", value: book.publisher },
                    { label: "税込価格", value: book.registeredPrice !== undefined ? `${book.registeredPrice.toLocaleString("ja-JP")}円` : undefined },
                    ...(book.areaIds.length ? [{ label: "分野", value: bookAreas.filter(area => book.areaIds.includes(area.id)).map(area => area.label).join("・") }] : []),
                    ...(book.keywords ? [{ label: "検索語", value: book.keywords }] : []),
                  ]} />
                  {priceNote && <p className={styles["SL-el_isbn-registration__feedback"]}>{priceNote}</p>}
                  {missingCover && publisherCover && <p className={styles["SL-el_isbn-registration__feedback"]}>{candidate && "書影候補の出典 "}<a href={publisherCover.pageUrl} target="_blank" rel="noreferrer">{publisherCover.publisher}の書籍ページ</a></p>}
                  {missingCover && !candidate && <p className={styles["SL-el_isbn-registration__feedback"]} role="alert">{coverFailed ? "書影を読み込めませんでした。別の画像を選んでください。" : "表紙画像を取得できませんでした。登録するには書影を選んでください。"}</p>}
                  {coverError && <p role="alert">{coverError}</p>}
                  {!missingCover && !coverReady && <p role="status">表紙画像を確認しています。</p>}
                  {(!book.title.trim() || !book.authors.some(name => name.trim())) && <p role="alert">登録するには書名と著者を入力してください。</p>}
                  {existing ? <p role="alert">このISBNの本は登録済みです。<Link href={`/books/${book.isbn}`}>登録済みの書籍を見る</Link></p> : sameTitle && <label><input type="checkbox" checked={titleAccepted} disabled={stage === "registering"} onChange={event => setTitleAccepted(event.target.checked)} />同じ書名の本があります。内容を確認したうえで続ける</label>}
                  {saveError && <div ref={errorSummary} tabIndex={-1} role="alert"><strong>登録できませんでした</strong><p>{saveError}</p></div>}
                </div>
                <div className={styles["SL-ly_isbn-registration__actions"]}>
                  {missingCover ? (
                    <>
                      <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        const message = validateCoverFile(file);
                        if (message) { setCoverError(message); return; }
                        setDirty(true);
                        showPreview({ ...book, cover: file });
                      }} />
                      {candidate && <button type="button" data-variant="primary" disabled={!candidateReady} onClick={() => {
                        setDirty(true);
                        showPreview({ ...book, cover: candidate });
                      }}>この書影を使う</button>}
                      {!candidate && <button type="button" data-variant="primary" onClick={() => coverInput.current?.click()}>書影を選ぶ</button>}
                    </>
                  ) : (
                    <button type="button" data-variant="primary" disabled={registrationUnknown || !register || !!existing || !coverReady || !book.title.trim() || !book.authors.some(name => name.trim()) || (sameTitle && !titleAccepted) || stage === "registering"} onClick={() => void submit()}>
                      {stage === "registering" ? "登録中…" : register ? (sampleRegistration ? "登録する（サンプル）" : "登録する") : "登録する（保存未接続）"}
                    </button>
                  )}
                  <button type="button" data-variant="secondary" disabled={stage === "registering"} onClick={() => setStage("manual")}>書籍情報を修正</button>
                  <button type="button" data-variant="neutral" disabled={stage === "registering" || registrationUnknown} onClick={() => setStage("isbn")}>ISBNを入力し直す</button>
                  {candidate && <button type="button" data-variant="secondary" onClick={() => coverInput.current?.click()}>手元の画像を使う</button>}
                </div>
              </div>
            </>
          )}
          {stage === "registered" && registered && (
            <>
              <h2 ref={heading} tabIndex={-1}>この本は登録済みです</h2>
              <div className={styles["SL-ly_isbn-registration__compact"]}>
                <div className={styles["SL-el_isbn-registration__cover"]}><Image src={registered.coverSrc} width={64} height={81} alt="登録済みの表紙" unoptimized /></div>
                <RegistrationIdentity {...registered} />
              </div>
              <p className={styles["SL-el_isbn-registration__feedback"]}>ISBN {registered.isbn}</p>
              <div className={styles["SL-ly_isbn-registration__outcome"]}>
                <Link data-variant="primary" href={`/books/${normalizeIsbn(registered.isbn)}`}>登録済みの書籍を見る</Link>
                <button type="button" data-variant="secondary" onClick={() => restart(true)}>別のISBNを入力</button>
              </div>
            </>
          )}
          {stage === "complete" && book && (
            <>
              <h2 ref={heading} tabIndex={-1}>{sampleRegistration ? "登録完了（サンプル）" : "登録しました"}</h2>
              <div className={styles["SL-ly_isbn-registration__compact"]}>
                <div className={styles["SL-el_isbn-registration__cover"]}><Image src={previewSrc} width={64} height={81} alt="登録した表紙" unoptimized /></div>
                <RegistrationIdentity {...book} />
              </div>
              <div className={styles["SL-ly_isbn-registration__outcome"]}>
                {!sampleRegistration && <Link data-variant="primary" href={`/books/${normalizeIsbn(book.isbn)}`}>登録した本を見る</Link>}
                <button type="button" data-variant={sampleRegistration ? "primary" : "secondary"} onClick={() => restart(true)}>続けて本を追加</button>
              </div>
            </>
          )}
        </div>
      </div>
    </BookFormScreen>
  );
}
