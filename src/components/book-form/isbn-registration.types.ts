import type { CheckedBookInput } from "./book-form.types";
export type PublisherCover = { src?: string; pageUrl: string; publisher: string };
export type LookupBook = { title: string; subtitle?: string; authors: readonly string[]; isbn: string; publisher?: string; editionPublicationText?: string; coverSrc?: string; publisherCover?: PublisherCover; registeredPrice?: number; priceNote?: string };
export type RegisteredBook = { isbn: string; title: string; subtitle?: string; authors: readonly string[]; coverSrc: string };
export type LookupResult = { status: "registered"; book: RegisteredBook } | { status: "found"; book: LookupBook } | { status: "not-found" };
export type IsbnLookup = (isbn: string, signal: AbortSignal) => Promise<LookupResult>;
/** 実保存は未接続。Storyでは成功/失敗を再現するport。 */
export type RegisterBook = (book: CheckedBookInput) => Promise<{ contentId: string }>;
export type OwnedBook = { id: string; title: string; isbn?: string };
