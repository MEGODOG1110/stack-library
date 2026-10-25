/** ローカル入力確認専用。CMSのpayloadや保存契約とは別。 */
export type BookFormDraft = {
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  areaIds: string[];
  keywords: string;
  price: string;
};
export type BookFormErrors = Partial<Record<"title" | "authors" | "isbn" | "cover" | "price", string>>;
export type FormTag = { id: string; label: string };
export type CheckedBookInput = {
  title: string;
  authors: string[];
  isbn: string;
  publisher?: string;
  areaIds: string[];
  keywords: string;
  registeredPrice?: number;
  /** 取得済み画像参照または端末のファイル。保存側で別途検証する。 */
  cover: File | string;
};
