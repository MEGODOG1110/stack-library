import { BookshelfPage } from "./BookshelfPage";
import { getCmsShelf } from "@/lib/books/microcms-books";

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  let data: Awaited<ReturnType<typeof getCmsShelf>> = {books:[],areas:[],tags:[]};
  let error: string | undefined;
  try { data = await getCmsShelf(); } catch { error = "microCMSから本棚を取得できませんでした。接続先とGET権限を確認して再試行してください。"; }
  const values = (value: string | string[] | undefined) => typeof value === "string" ? [value] : value ?? [];
  const keyword = values(query.q)[0] ?? "";
  const filters = { areaIds: values(query.area), tagIds: values(query.tag) };
  const view = query.view === "search" ? "search" : "shelf";
  return (
    <main>
      <BookshelfPage key={JSON.stringify([keyword, filters, view])} keyword={keyword} filters={filters} view={view} {...data} error={error} />
    </main>
  );
}
