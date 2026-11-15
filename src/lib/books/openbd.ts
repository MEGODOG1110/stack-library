import type { LookupResult } from "@/components/book-form/isbn-registration.types";
import { printListPrice, type OnixPrice } from "./print-price";

type OnixText = string | { content?: string };
type TitleElement = { TitleElementLevel?: string; TitleText?: OnixText; TitleWithoutPrefix?: OnixText; TitlePrefix?: OnixText; Subtitle?: OnixText };
type TitleDetail = { TitleType?: string; TitleElement?: TitleElement | TitleElement[] };
type Entry = { summary?: { isbn?: string; title?: string; author?: string; publisher?: string; pubdate?: string; cover?: string }; onix?: { DescriptiveDetail?: { ProductForm?: string; TitleDetail?: TitleDetail | TitleDetail[]; Contributor?: { PersonName?: string | { content?: string } }[] }; ProductSupply?: { SupplyDetail?: { Price?: OnixPrice[] } } } };

/** 固定の公開書誌APIのみを読む。画像のダウンロード・保存はしない。 */
export async function lookupOpenBd(isbn: string, signal: AbortSignal): Promise<LookupResult> {
  const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${encodeURIComponent(isbn)}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Bibliography unavailable");
  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || payload.length !== 1) throw new Error("Invalid bibliography response");
  if (payload[0] === null) return { status: "not-found" };
  const entry = payload[0] as Entry;
  const summary = entry.summary;
  if (!summary || summary.isbn !== isbn || typeof summary.title !== "string") throw new Error("Invalid bibliography identity");
  const contributors = entry.onix?.DescriptiveDetail?.Contributor;
  const authors = Array.isArray(contributors) ? contributors.flatMap((item) => {
    const value = typeof item.PersonName === "string" ? item.PersonName : item.PersonName?.content;
    return typeof value === "string" && value.trim() ? [value] : [];
  }) : [];
  const text = (value: unknown) => typeof value === "string" && value.trim() ? value : undefined;
  const titleDetails = entry.onix?.DescriptiveDetail?.TitleDetail;
  const titleElements = (Array.isArray(titleDetails) ? titleDetails : [titleDetails])
    .filter(detail => detail?.TitleType === "01")
    .flatMap(detail => detail?.TitleElement ?? []);
  const productTitle = titleElements.find(element => element.TitleElementLevel === "01")
    ?? titleElements.find(element => element.TitleElementLevel === undefined);
  const onixText = (value?: OnixText) => text(typeof value === "string" ? value : value?.content)?.trim();
  const titleWithoutPrefix = onixText(productTitle?.TitleWithoutPrefix);
  const title = onixText(productTitle?.TitleText)
    ?? (titleWithoutPrefix ? [onixText(productTitle?.TitlePrefix), titleWithoutPrefix].filter(Boolean).join(" ") : summary.title);
  const subtitle = onixText(productTitle?.Subtitle);
  const prices = entry.onix?.ProductSupply?.SupplyDetail?.Price;
  const list = Array.isArray(prices) ? prices : [];
  const registeredPrice = printListPrice(entry.onix?.DescriptiveDetail?.ProductForm, list);
  const priceNote = registeredPrice !== undefined
    ? list.some(price=>["01","03"].includes(price.PriceType ?? ""))
      ? "openBDの税抜定価に消費税10％を加算しました（1円未満切捨て）。必要なら修正できます。"
      : "openBDの税込定価です。必要なら修正できます。"
    : "紙の本の税込定価を補完できませんでした。価格は任意入力です。";
  return { status: "found", book: { isbn, title, subtitle, authors: authors.length ? authors : text(summary.author) ? [summary.author!] : [], publisher: text(summary.publisher), editionPublicationText: text(summary.pubdate), registeredPrice, priceNote, coverSrc: text(summary.cover)?.startsWith("https://") ? summary.cover : undefined } };
}
