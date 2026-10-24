import styles from "./page.module.css";
import { BookshelfPage } from "./BookshelfPage";
import { shelfAreas, shelfTags } from "@/components/bookshelf/bookshelf.fixtures";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const values = (value: string | string[] | undefined) => typeof value === "string" ? [value] : value ?? [];
  const keyword = values(query.q)[0] ?? "";
  const filters = { areaIds: values(query.area).filter((id) => shelfAreas.some((area) => area.id === id)), tagIds: values(query.tag).filter((id) => shelfTags.some((tag) => tag.id === id)) };
  const view = query.view === "search" ? "search" : "shelf";
  return (
    <main>
      <p className={styles["SL-el_sample-notice"]}>表示確認用サンプル・データ保存なし</p>
      <BookshelfPage key={JSON.stringify([keyword, filters, view])} keyword={keyword} filters={filters} view={view} />
    </main>
  );
}
