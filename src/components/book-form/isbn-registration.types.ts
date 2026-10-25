import type { CheckedBookInput } from "./book-form.types";
export type LookupBook = { title: string; authors: readonly string[]; isbn: string; publisher?: string; editionPublicationText?: string; coverSrc?: string; registeredPrice?: number; priceNote?: string };
export type LookupResult = { status: "found"; book: LookupBook } | { status: "not-found" };
export type IsbnLookup = (isbn: string, signal: AbortSignal) => Promise<LookupResult>;
/** 実保存は未接続。Storyでは成功/失敗を再現するport。 */
export type RegisterBook = (book: CheckedBookInput) => Promise<{ contentId: string }>;
export type OwnedBook = { id: string; title: string; isbn?: string };
