import type { BookFormDraft, BookFormErrors, CheckedBookInput } from "./book-form.types";

export const emptyBookDraft: BookFormDraft = { title: "", authors: "", isbn: "", publisher: "", editionPublicationText: "", tagIds: [], price: "" };
export function checkBookInput(draft: BookFormDraft, cover?: File): { errors: BookFormErrors; value?: CheckedBookInput } {
  const errors: BookFormErrors = {};
  const title = draft.title.trim();
  const authors = draft.authors.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
  const isbn = draft.isbn.normalize("NFKC").replace(/[-\s]/g, "");
  const priceText = draft.price.normalize("NFKC").trim();
  const price = priceText === "" ? undefined : Number(priceText);
  if (!title) errors.title = "書名を入力してください";
  if (!authors.length) errors.authors = "著者を1名以上入力してください";
  if (isbn && (!/^(978|979)\d{10}$/.test(isbn) || [...isbn].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 ? 3 : 1), 0) % 10 !== 0)) errors.isbn = "ISBNは正しい13桁の番号を入力してください";
  if (!cover) errors.cover = "表紙画像を選択し、プレビューを確認してください";
  if (price !== undefined && (!Number.isFinite(price) || price < 0)) errors.price = "税込価格は0以上の数値を入力してください";
  if (Object.keys(errors).length || !cover) return { errors };
  return { errors, value: { title, authors, isbn: isbn || undefined, publisher: draft.publisher.trim() || undefined, editionPublicationText: draft.editionPublicationText.trim() || undefined, tagIds: [...draft.tagIds], registeredPrice: price, cover } };
}
