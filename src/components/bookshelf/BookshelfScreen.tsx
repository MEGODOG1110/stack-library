"use client";

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
  const size = name === "filter" ? 16 : 20;
  if (name === "close") return <Image src="/mockups/bookshelf/close.svg" width={20} height={20} alt="" unoptimized />;
  if (name === "back") return <Image src="/mockups/bookshelf/back.svg" width={20} height={20} alt="" unoptimized />;
  return <><Image className={styles["SL-el_bookshelf__mobile-icon"]} src={`/mockups/bookshelf/${name}.svg`} width={size} height={size} alt="" unoptimized /><Image className={styles["SL-el_bookshelf__desktop-icon"]} src={`/mockups/bookshelf/desktop/${name}.svg`} width={20} height={20} alt="" unoptimized /></>;
}

export function BookshelfScreen({ books, areas, tags, initialKeyword = "", initialFilters, initialView = "shelf", error, onRetry, onSelectBook, onAddBook }: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [filters, setFilters] = useState<ShelfFilters>(initialFilters ?? emptyFilters);
  const [draft, setDraft] = useState<ShelfFilters>(initialFilters ?? emptyFilters);
  const [draftKeyword, setDraftKeyword] = useState(initialKeyword);
  const [view, setView] = useState(initialView);
  const [selected, setSelected] = useState<ShelfBook>();
  const filterDialog = useRef<HTMLDialogElement>(null);
  const sortDialog = useRef<HTMLDialogElement>(null);
  const bookDialog = useRef<HTMLDialogElement>(null);
  const searchFormInput = useRef<HTMLInputElement>(null);
  const searchTab = useRef<HTMLButtonElement>(null);
  const shelfScroll = useRef(0);
  const openedSearch = useRef(initialView === "search");
  useEffect(() => {
    if (view === "search") {
      window.scrollTo(0, 0);
      searchFormInput.current?.focus();
    } else if (openedSearch.current) {
      searchTab.current?.focus({ preventScroll: true });
      window.scrollTo(0, shelfScroll.current);
    }
  }, [view]);
  const filtered = keyword.trim() !== "" || filters.areaIds.length > 0 || filters.tagIds.length > 0;
  function filterBooks(query: string, conditions: ShelfFilters) {
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    return books.filter((book) => {
    const searchable = normalize([book.title, ...book.authors, book.isbn ?? ""].join(" "));
    return terms.every((term) => searchable.includes(term))
      && (!conditions.areaIds.length || conditions.areaIds.some((id) => book.areaIds.includes(id)))
      && (!conditions.tagIds.length || conditions.tagIds.some((id) => book.tagIds.includes(id)));
  }).sort(compareBooksByTitle);
  }
  const matches = filterBooks(keyword, filters);
  const activeLabels = [
    ...areas.filter((area) => filters.areaIds.includes(area.id)),
    ...tags.filter((tag) => filters.tagIds.includes(tag.id)),
  ];
  function clear() { setKeyword(""); setFilters(emptyFilters()); }
  function openSearch() {
    if (view === "search") return;
    shelfScroll.current = window.scrollY;
    openedSearch.current = true;
    setDraft({ areaIds: [...filters.areaIds], tagIds: [...filters.tagIds] });
    setDraftKeyword(keyword);
    setView("search");
  }
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
        {([{ key: "areaIds", label: "分野", options: areas }, { key: "tagIds", label: "技術タグ", options: tags }] as const).map((group) => <fieldset key={group.key}>
          <legend>{group.label}（複数選択可）</legend>
          <div className={styles["SL-ly_bookshelf__choices"]}>{group.options.map((option) => <label key={option.id} className={styles["SL-el_bookshelf__choice"]}>
            <input type="checkbox" checked={draft[group.key].includes(option.id)} onChange={() => toggle(group.key, option.id)} />{option.label}
          </label>)}</div>
        </fieldset>)}
        <label htmlFor="bookshelf-sort">並び替え</label>
        <select id="bookshelf-sort" defaultValue="title"><option value="title">書名順（読み）</option></select>
        <div className={styles["SL-ly_bookshelf__form-actions"]}>
          <button type="button" onClick={() => { clear(); setDraftKeyword(""); setDraft(emptyFilters()); }}>条件をクリア</button>
          <button type="submit">結果を見る（{filterBooks(draftKeyword, draft).length}冊）</button>
        </div>
      </form>}
      <div hidden={view === "search"}>
      <div className={styles["SL-ly_bookshelf__toolbar"]}>
        <label className={styles["SL-el_bookshelf__search"]}>
          <Icon name="search" />
          <span className={styles["SL-ut_visually-hidden"]}>タイトル・著者・ISBNで検索</span>
          <input type="search" placeholder="タイトル・著者・ISBN" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <button type="button" aria-label="絞り込み条件" onClick={() => filterDialog.current?.showModal()}><Icon name="filter" /></button>
        <button type="button" aria-label="並び替え" onClick={() => sortDialog.current?.showModal()}><Icon name="sort" /></button>
      </div>
      {activeLabels.length > 0 && <ul className={styles["SL-ly_bookshelf__chips"]} aria-label="適用中の条件">{activeLabels.map((option, index) => <li key={`${option.id}-${index}`}>{option.label}</li>)}</ul>}
      <div className={styles["SL-ly_bookshelf__content"]}>
        {error ? <div className={styles["SL-el_bookshelf__message"]} role="alert"><p>{error}</p><button type="button" onClick={onRetry} disabled={!onRetry}>再読み込み</button></div>
          : books.length === 0 ? <div className={styles["SL-el_bookshelf__message"]}><p>まだ本がありません</p><button type="button" onClick={onAddBook} disabled={!onAddBook}>本を追加{!onAddBook && "（準備中）"}</button></div>
          : filtered ? <>{matches.length ? <BookShelf label="検索結果" books={matches} onSelect={select} announceCount /> : <div className={styles["SL-el_bookshelf__message"]}><p role="status">0冊</p><p>条件に合う本がありません</p><button type="button" onClick={clear}>条件をクリア</button></div>}</>
          : <>{areas.map((area) => { const shelf = matches.filter((book) => book.areaIds.includes(area.id)); return shelf.length > 0 && <BookShelf key={area.id} label={`${area.label}棚`} books={shelf} onSelect={select} />; })}{matches.some((book) => !book.areaIds.some((id) => areas.some((area) => area.id === id))) && <BookShelf label="未分類棚" books={matches.filter((book) => !book.areaIds.some((id) => areas.some((area) => area.id === id)))} onSelect={select} />}</>}
      </div>
      </div>
      <nav className={styles["SL-ly_bookshelf__navigation"]} aria-label="メインナビゲーション">
        <button type="button" aria-current={view === "shelf" ? "page" : undefined} onClick={() => setView("shelf")}><Icon name="home" /><span>本棚</span></button>
        <button ref={searchTab} type="button" aria-current={view === "search" ? "page" : undefined} onClick={openSearch}><Icon name="search" /><span>検索</span></button>
        <button type="button" onClick={onAddBook} disabled={!onAddBook} aria-label={onAddBook ? "本を追加" : "本を追加（準備中）"}><Icon name="add" /><span>追加{!onAddBook && <small>準備中</small>}</span></button>
        <button type="button" disabled aria-label="蔵書金額（準備中）"><Icon name="price" /><span>金額<small>準備中</small></span></button>
      </nav>

      <dialog ref={filterDialog} className={styles["SL-el_bookshelf__dialog"]} aria-labelledby="bookshelf-filter-title">
        <div className={styles["SL-ly_bookshelf__dialog-header"]}><h2 id="bookshelf-filter-title">絞り込み条件</h2><button type="button" aria-label="閉じる" onClick={() => filterDialog.current?.close()}><Icon name="close" /></button></div>
        <p>{activeLabels.length ? activeLabels.map((option) => option.label).join(" / ") : "分野・タグの指定はありません"}</p><button type="button" onClick={() => { filterDialog.current?.close(); openSearch(); }}>条件を変更</button><button type="button" onClick={() => { clear(); filterDialog.current?.close(); }}>条件をクリア</button>
      </dialog>
      <dialog ref={sortDialog} className={styles["SL-el_bookshelf__dialog"]} aria-labelledby="bookshelf-sort-title"><h2 id="bookshelf-sort-title">並び替え</h2><p>書名順（読み）</p><button type="button" onClick={() => sortDialog.current?.close()}>閉じる</button></dialog>
      <dialog ref={bookDialog} className={styles["SL-el_bookshelf__dialog"]} aria-labelledby="bookshelf-book-title"><h2 id="bookshelf-book-title">書籍の確認</h2>{selected && <><h3>{selected.title}</h3><p>{selected.authors.join("・")}</p>{selected.isbn && <p>ISBN {selected.isbn}</p>}</>}<button type="button" onClick={() => bookDialog.current?.close()}>閉じる</button></dialog>
    </div>
  );
}
