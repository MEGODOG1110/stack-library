import { notFound } from "next/navigation";
import { detailBooks } from "@/components/book-detail/book-detail.fixtures";
import { DetailNavigation } from "./DetailNavigation";
import styles from "../../page.module.css";

export function generateStaticParams() { return detailBooks.map((book) => ({ contentId: book.id })); }

export default async function BookDetailPage({ params, searchParams }: {
  params: Promise<{ contentId: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const [{ contentId }, query] = await Promise.all([params, searchParams]);
  const book = detailBooks.find((item) => item.id === contentId);
  if (!book) notFound();
  let returnTo = "/";
  if (typeof query.from === "string") {
    try {
      const url = new URL(query.from, "https://stack-library.invalid");
      if (url.origin === "https://stack-library.invalid" && url.pathname === "/") returnTo = url.pathname + url.search;
    } catch { /* 不正な戻り先は本棚へ。 */ }
  }
  return <main><p className={styles["SL-el_sample-notice"]}>表示確認用サンプル・データ保存なし</p><DetailNavigation book={book} returnTo={returnTo} /></main>;
}
