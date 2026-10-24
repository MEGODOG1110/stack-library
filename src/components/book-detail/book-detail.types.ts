/** 詳細表示の入力。microCMSの保存形式や登録commandとは独立。 */
export type BookDetail = {
  id: string;
  title: string;
  authors: readonly string[];
  coverSrc: string;
  isbn?: string;
  publisher?: string;
  editionPublicationText?: string;
  tags: readonly { id: string; label: string }[];
  registeredPrice?: number;
  readingStatus?: "tsundoku" | "reading" | "read";
  summary?: string;
};
