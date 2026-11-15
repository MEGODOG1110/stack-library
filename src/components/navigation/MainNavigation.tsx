"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type MouseEventHandler } from "react";
import styles from "./MainNavigation.module.css";

type Props = {
  current?: "shelf" | "add";
  shelfHref?: string;
  onShelfClick?: MouseEventHandler<HTMLAnchorElement>;
  onShelf?: () => void;
  onAdd?: () => void;
  addDisabled?: boolean;
  mobileInline?: boolean;
  onMenuOpen?: () => void;
};

function NavigationIcon({ name }: { name: "v2/bookshelf" | "add" | "v2/currency-yen" | "v2/menu" }) {
  return <span aria-hidden="true" className={styles["SL-el_main-navigation__icon"]} style={{ maskImage: `url(/mockups/bookshelf/${name}.svg)` }} />;
}

export function MainNavigation({ current, shelfHref = "/", onShelfClick, onShelf, onAdd, addDisabled, mobileInline, onMenuOpen }: Props) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  function closeMenu() {
    setOpen(false);
    if (open) trigger.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    if (!open) return;
    nav.current?.querySelector<HTMLElement>("a, button:not(:disabled)")?.focus({ preventScroll: true });
    const desktop = window.matchMedia("(min-width: 1000px)");
    function dismiss(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    }
    function resize(event: MediaQueryListEvent) { if (event.matches) setOpen(false); }
    window.addEventListener("keydown", dismiss);
    desktop.addEventListener("change", resize);
    return () => {
      window.removeEventListener("keydown", dismiss);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);
  const shelf = <><NavigationIcon name="v2/bookshelf" /><span>本棚</span></>;
  const add = <><NavigationIcon name="add" /><span>追加{addDisabled && <small>準備中</small>}</span></>;
  const shelfCurrent = current === "shelf" ? "page" : undefined;
  return (
    <>
    {!mobileInline && <button ref={trigger} type="button" className={styles["SL-el_main-navigation__trigger"]} aria-label="メニュー" aria-expanded={open} aria-controls={id} onClick={() => {
      if (!open) onMenuOpen?.();
      setOpen(!open);
    }}><NavigationIcon name="v2/menu" /></button>}
    <nav ref={nav} id={id} data-mobile={mobileInline ? "inline" : open ? "menu" : undefined} className={styles["SL-ly_main-navigation"]} aria-label="メインナビゲーション">
      {onShelf
        ? <button type="button" aria-current={shelfCurrent} onClick={() => { closeMenu(); onShelf(); }}>{shelf}</button>
        : <Link href={shelfHref} aria-current={shelfCurrent} onClick={onShelfClick}>{shelf}</Link>}
      {current === "add"
        ? <span aria-current="page">{add}</span>
        : onAdd || addDisabled
          ? <button type="button" disabled={addDisabled} aria-label={addDisabled ? "本を追加（準備中）" : "本を追加"} onClick={onAdd}>{add}</button>
          : <Link href="/books/new" aria-label="本を追加">{add}</Link>}
      <button type="button" disabled aria-label="蔵書金額（準備中）">
        <NavigationIcon name="v2/currency-yen" /><span>金額<small>準備中</small></span>
      </button>
    </nav>
    </>
  );
}
