/** 本棚UIの入力。CMSの保存形式とは独立した表示用の型。 */
export type ShelfBook = {
  id: string;
  title: string;
  /** 書名順の比較に使う読み。表示用タイトルとは分離する。 */
  titleReading: string;
  authors: readonly string[];
  isbn?: string;
  coverSrc: string;
  areaIds: readonly string[];
  tagIds: readonly string[];
  createdAt: string;
};

export type ShelfOption = { id: string; label: string };
export type ShelfFilters = { areaIds: string[]; tagIds: string[] };
