"use client";

import { MainNavigation } from "@/components/navigation/MainNavigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BookShelf } from "./BookShelf";
import type { ShelfBook, ShelfFilters, ShelfOption } from "./bookshelf.types";
import styles from "./BookshelfScreen.module.css";

type Props = {
  books: readonly ShelfBook[];
  areas: readonly ShelfOption[];
  tags: readonly ShelfOption[];
  initialKeyword?: string;
  initialFilters?: ShelfFilters;
  initialView?: "shelf" | "search";
  error?: string;
  onRetry?: () => void;
  loadingBookId?: string;
  onSelectBook?: (book: ShelfBook, context: { keyword: string; filters: ShelfFilters }) => void;
  onAddBook?: () => void;
};

const emptyFilters = (): ShelfFilters => ({ areaIds: [], tagIds: [] });
const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("ja");
const titleCollator = new Intl.Collator("ja", { numeric: true, ignorePunctuation: true });
const readingKey = (value: string) => value.normalize("NFKC").replace(/\s+/gu, "").replace(/[ァ-ヶ]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60));

export function compareBooksByTitle(a: ShelfBook, b: ShelfBook) {
  return titleCollator.compare(readingKey(a.titleReading), readingKey(b.titleReading))
    || titleCollator.compare(normalize(a.title), normalize(b.title))
    || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    search: "search", filter: "desktop/filter", add: "add",
  };
  const asset = icons[name];
  if (!asset) return <Image className="SL-ut_theme-icon" src={`/mockups/bookshelf/${name}.svg`} width={20} height={20} alt="" unoptimized />;
  return <span aria-hidden="true" className={styles["SL-el_bookshelf__icon"]} style={{ maskImage: `url(/mockups/bookshelf/${asset}.svg)` }} />;
}

export function BookshelfScreen({ books, areas, tags, initialKeyword = "", initialFilters, initialView = "shelf", error, onRetry, onSelectBook, onAddBook, loadingBookId }: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [filters, setFilters] = useState<ShelfFilters>(initialFilters ?? emptyFilters);
  const [draft, setDraft] = useState<ShelfFilters>(initialFilters ?? emptyFilters);
  const [draftKeyword, setDraftKeyword] = useState(initialKeyword);
  const [view, setView] = useState(initialView);
  const [selected, setSelected] = useState<ShelfBook>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<ShelfFilters>(emptyFilters);
  const chipFocus = useRef<number | null>(null);
  const chips = useRef<HTMLUListElement>(null);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const filterPanel = useRef<HTMLFormElement>(null);
  const bookDialog = useRef<HTMLDialogElement>(null);
  const searchFormInput = useRef<HTMLInputElement>(null);
  const shelfSearchInput = useRef<HTMLInputElement>(null);
  const shelfScroll = useRef(0);
  useEffect(() => {
    if (view === "search") {
      window.scrollTo(0, 0);
      searchFormInput.current?.focus();
    } else if (initialView === "search") {
      shelfSearchInput.current?.focus({ preventScroll: true });
      window.scrollTo(0, shelfScroll.current);
    }
  }, [view, initialView]);
  useEffect(() => {
    if (!filterOpen) return;
    filterPanel.current?.querySelector("button")?.focus({ preventScroll: true });
    function dismiss(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      setFilterOpen(false);
      filterTrigger.current?.focus();
    }
    function dismissOutside(event: PointerEvent) {
      if (!window.matchMedia("(min-width: 1000px)").matches || !(event.target instanceof Node)) return;
      if (!filterPanel.current?.contains(event.target) && !filterTrigger.current?.contains(event.target)) setFilterOpen(false);
    }
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismissOutside);
    return () => {
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismissOutside);
    };
  }, [filterOpen]);
  function closeFilter() {
    setFilterOpen(false);
    filterTrigger.current?.focus();
  }
  const filtered = keyword.trim() !== "" || filters.areaIds.length > 0 || filters.tagIds.length > 0;
  function filterBooks(query: string, conditions: ShelfFilters) {
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    return books.filter((book) => {
    const searchable = normalize([book.title, ...book.authors, book.isbn ?? "", ...book.tagIds].join(" "));
    return terms.every((term) => searchable.includes(term))
      && (!conditions.areaIds.length || conditions.areaIds.some((id) => book.areaIds.includes(id)))
      && (!conditions.tagIds.length || conditions.tagIds.some((id) => book.tagIds.includes(id)));
  }).sort(compareBooksByTitle);
  }
  const matches = filterBooks(keyword, filters);
  const activeLabels = ([
    { key: "areaIds", group: "分野", options: areas },
    { key: "tagIds", group: "検索語", options: tags },
  ] as const).flatMap(({ key, group, options }) =>
    options.filter((option) => filters[key].includes(option.id)).map((option) => ({ ...option, key, group })),
  );
  useEffect(() => {
    if (chipFocus.current === null) return;
    const buttons = chips.current?.querySelectorAll("button");
    const next = buttons?.[Math.min(chipFocus.current, buttons.length - 1)] ?? filterTrigger.current;
    chipFocus.current = null;
    next?.focus({ preventScroll: true });
  }, [filters]);
  function clear() { setKeyword(""); setFilters(emptyFilters()); }
  function toggle(group: keyof ShelfFilters, id: string) {
    setDraft((current) => ({ ...current, [group]: current[group].includes(id) ? current[group].filter((value) => value !== id) : [...current[group], id] }));
  }
  function select(book: ShelfBook) {
    if (onSelectBook) { onSelectBook(book, { keyword, filters }); return; }
    setSelected(book);
    bookDialog.current?.showModal();
  }

  return (
    <div className={styles["SL-ly_bookshelf"]}>
      <h1 className={styles["SL-ut_visually-hidden"]}>{view === "search" ? "検索・絞り込み" : "本棚"}</h1>
      {view === "search" && <form className={styles["SL-ly_bookshelf__filter-form"]} onSubmit={(event) => {
        event.preventDefault(); setKeyword(draftKeyword); setFilters(draft); shelfScroll.current = 0; setView("shelf");
      }}>
        <label htmlFor="bookshelf-keyword">キーワード</label>
        <div className={styles["SL-ly_bookshelf__keyword-row"]}>
          <button type="button" aria-label="本棚に戻る" onClick={() => setView("shelf")}><Icon name="back" /></button>
          <input id="bookshelf-keyword" ref={searchFormInput} type="search" placeholder="タイトル・著者・ISBN" value={draftKeyword} onChange={(event) => setDraftKeyword(event.target.value)} />
        </div>
        {([{ key: "areaIds", label: "分野", options: areas }, { key: "tagIds", label: "検索語", options: tags }] as const).map((group) => <fieldset key={group.key}>
          <legend>{group.label}（複数選択可）</legend>
          <div className={styles["SL-ly_bookshelf__choices"]}>{group.options.map((option) => <label key={option.id} className={styles["SL-el_bookshelf__choice"]}>
            <input type="checkbox" checked={draft[group.key].includes(option.id)} onChange={() => toggle(group.key, option.id)} />{option.label}
          </label>)}</div>
        </fieldset>)}
        <div className={styles["SL-ly_bookshelf__form-actions"]}>
          <button type="button" onClick={() => { clear(); setDraftKeyword(""); setDraft(emptyFilters()); }}>条件をクリア</button>
          <button type="submit">結果を見る（{filterBooks(draftKeyword, draft).length}冊）</button>
        </div>
      </form>}
      <div hidden={view === "search"}>
      <div className={styles["SL-ly_bookshelf__controls"]}>
      <div className={styles["SL-ly_bookshelf__toolbar"]}>
        <label className={styles["SL-el_bookshelf__search"]}>
          <Icon name="search" />
          <span className={styles["SL-ut_visually-hidden"]}>タイトル・著者・ISBNで検索</span>
          <input ref={shelfSearchInput} type="search" placeholder="タイトル・著者で検索" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <button ref={filterTrigger} type="button" data-tool="filter" aria-expanded={filterOpen} aria-controls="bookshelf-filter-panel" onClick={() => {
          if (filterOpen) { closeFilter(); return; }
          setFilterDraft(filters);
          setFilterOpen(true);
        }}><Icon name="filter" />絞り込み</button>
        <span className={styles["SL-el_bookshelf__sort-order"]}>書名順</span>
        <button type="button" data-tool="add" aria-label="本を追加" onClick={onAddBook} disabled={!onAddBook}><Icon name="add" /></button>
      </div>
      <form ref={filterPanel} id="bookshelf-filter-panel" hidden={!filterOpen} className={styles["SL-el_bookshelf__filter-panel"]} aria-labelledby="bookshelf-filter-title" onSubmit={(event) => {
        event.preventDefault();
        setFilters(filterDraft);
        closeFilter();
      }}>
        <header className={styles["SL-ly_bookshelf__dialog-header"]}>
          <h2 id="bookshelf-filter-title">絞り込み</h2>
          <button type="button" aria-label="閉じる" onClick={closeFilter}><Icon name="close" /></button>
        </header>
        {([{ key: "areaIds", label: "分野", options: areas }, { key: "tagIds", label: "検索語", options: tags }] as const).map(({ key, label, options }) => (
          <fieldset key={key} className={styles["SL-el_bookshelf__filter-group"]}>
            <legend>{label}</legend>
            <div className={key === "tagIds" ? styles["SL-ly_bookshelf__keyword-list"] : undefined}>
              {options.length === 0 && <p>選択肢がありません</p>}
              {options.map((option) => (
                <label key={option.id} className={styles["SL-el_bookshelf__filter-option"]}>
                  <input type="checkbox" checked={filterDraft[key].includes(option.id)} onChange={(event) => {
                    const checked = event.target.checked;
                    setFilterDraft((current) => ({
                      ...current,
                      [key]: checked ? [...current[key], option.id] : current[key].filter((id) => id !== option.id),
                    }));
                  }} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <footer className={styles["SL-ly_bookshelf__filter-footer"]}>
          <button type="button" onClick={() => setFilterDraft(emptyFilters())}>絞り込みを解除</button>
          <button type="submit">結果を見る（{filterBooks(keyword, filterDraft).length}冊）</button>
        </footer>
      </form>
      </div>
      {activeLabels.length > 0 && <ul ref={chips} className={styles["SL-ly_bookshelf__chips"]} aria-label="適用中の条件">
        {activeLabels.map(({ key, group, id, label }, index) => (
          <li key={`${key}-${id}`}>
            <button type="button" aria-label={`${label} の絞り込みを解除（${group}）`} onClick={() => {
              chipFocus.current = index;
              setFilters((current) => ({ ...current, [key]: current[key].filter((value) => value !== id) }));
            }}>
              <span>{label}</span>
              <Image className="SL-ut_theme-icon" src="/mockups/bookshelf/close.svg" width={16} height={16} alt="" unoptimized />
            </button>
          </li>
        ))}
      </ul>}
      <div className={styles["SL-ly_bookshelf__content"]}>
        {error ? <div className={styles["SL-el_bookshelf__message"]} role="alert"><p>{error}</p><button type="button" onClick={onRetry} disabled={!onRetry}>再読み込み</button></div>
          : filtered ? <BookShelf label="検索結果" books={matches} onSelect={select} loadingBookId={loadingBookId} announceCount emptyContent={
            <div className={styles["SL-el_bookshelf__no-results"]}>
              <p>条件に合う本がありません</p>
              {activeLabels.length > 0
                ? <button type="button" onClick={() => { setFilters(emptyFilters()); filterTrigger.current?.focus(); }}>絞り込みを解除</button>
                : <button type="button" onClick={() => { clear(); filterTrigger.current?.focus(); }}>検索語をクリア</button>}
            </div>
          } />
          : books.length === 0 ? <div className={styles["SL-el_bookshelf__message"]}><p>まだ本がありません</p><button type="button" onClick={onAddBook} disabled={!onAddBook}>本を追加{!onAddBook && "（準備中）"}</button></div>
          : <>{areas.map((area) => { const shelf = matches.filter((book) => book.areaIds.find((id) => areas.some((option) => option.id === id)) === area.id); return shelf.length > 0 && <BookShelf key={area.id} label={area.label} books={shelf} onSelect={select} loadingBookId={loadingBookId} />; })}{matches.some((book) => !book.areaIds.some((id) => areas.some((area) => area.id === id))) && <BookShelf label="未分類" books={matches.filter((book) => !book.areaIds.some((id) => areas.some((area) => area.id === id)))} onSelect={select} loadingBookId={loadingBookId} />}</>}
      </div>
      </div>
      <MainNavigation
        current={view === "shelf" ? "shelf" : undefined}
        mobileInline={view === "search"} onMenuOpen={() => setFilterOpen(false)}
        onShelf={() => setView("shelf")}
        onAdd={onAddBook} addDisabled={!onAddBook}
      />

      <dialog ref={bookDialog} className={styles["SL-el_bookshelf__dialog"]} aria-labelledby="bookshelf-book-title"><h2 id="bookshelf-book-title">書籍の確認</h2>{selected && <><h3>{selected.title}</h3><p>{selected.authors.join("・")}</p>{selected.isbn && <p>ISBN {selected.isbn}</p>}</>}<button type="button" onClick={() => bookDialog.current?.close()}>閉じる</button></dialog>
    </div>
  );
}
