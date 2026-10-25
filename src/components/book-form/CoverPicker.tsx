"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./CoverPicker.module.css";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
export function CoverPicker({ id, error, onChange, onDirty }: { id: string; error?: string; onChange: (file?: File) => void; onDirty?: () => void }) {
  const [selection, setSelection] = useState<{ file: File; url: string; ready: boolean }>();
  const [failure, setFailure] = useState("");
  const urlRef = useRef<string | undefined>(undefined);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  function clear(resetInput = true) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = undefined;
    setSelection(undefined); onChange(undefined);
    if (resetInput && input.current) input.current.value = "";
  }
  const message = failure || error;
  return <div className={styles["SL-el_cover-picker"]}>
    <label htmlFor={id}>表紙画像（必須）</label>
    <input ref={input} id={id} name="cover" type="file" accept={acceptedTypes.join(",")} aria-invalid={message ? true : undefined} aria-describedby={`${id}-hint${message ? ` ${id}-error` : ""}`} onChange={(event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      onDirty?.(); clear(false); setFailure("");
      if (!acceptedTypes.includes(file.type)) { event.currentTarget.value = ""; setFailure("JPEG・PNG・WebPの画像を選択してください"); return; }
      if (file.size > 10 * 1024 * 1024) { event.currentTarget.value = ""; setFailure("10MB以下の画像を選択してください"); return; }
      const url = URL.createObjectURL(file); urlRef.current = url;
      setSelection({ file, url, ready: false });
    }} />
    <p id={`${id}-hint`}>JPEG・PNG・WebP、10MB以下。画像は端末内でプレビューします。</p>
    {selection ? <div className={styles["SL-ly_cover-picker__preview"]}>
      <Image key={selection.url} src={selection.url} width={104} height={157} alt="選択した書影のプレビュー" unoptimized loading="eager" onLoad={() => {
        if (urlRef.current !== selection.url) return;
        setSelection({ ...selection, ready: true }); onChange(selection.file);
      }} onError={() => { if (urlRef.current !== selection.url) return; clear(); setFailure("画像を読み込めませんでした。別の画像を選択してください"); }} />
      <div><p>{selection.file.name}</p><p role="status">{selection.ready ? "選択済み（未保存）" : "画像を確認しています"}</p><button type="button" onClick={() => { onDirty?.(); clear(); setFailure(""); }}>画像を外す</button></div>
    </div> : <p>画像を選択していません</p>}
    {message && <p id={`${id}-error`} className={styles["SL-el_cover-picker__error"]} role="alert">{message}</p>}
  </div>;
}
