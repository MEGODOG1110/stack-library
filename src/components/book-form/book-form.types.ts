/** ローカル入力確認専用。CMSのpayloadや保存契約とは別。 */
export type BookFormDraft = {
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  editionPublicationText: string;
  tagIds: string[];
  price: string;
};
export type BookFormErrors = Partial<Record<"title" | "authors" | "isbn" | "cover" | "price", string>>;
export type FormTag = { id: string; label: string };
export type CheckedBookInput = {
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  editionPublicationText?: string;
  tagIds: string[];
  registeredPrice?: number;
  cover: File;
};
