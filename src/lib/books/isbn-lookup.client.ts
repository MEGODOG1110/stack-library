import type { IsbnLookup, LookupResult } from "@/components/book-form/isbn-registration.types";

/** StorybookもNext.jsの同じ実APIへ接続する（Storybookは別ポート）。 */
export const liveIsbnLookup: IsbnLookup = async (isbn, signal) => {
  const origin = typeof window !== "undefined" && window.location.port === "6006" ? "http://localhost:3000" : "";
  const response = await fetch(`${origin}/api/books/lookup?isbn=${encodeURIComponent(isbn)}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("ISBN lookup failed");
  return await response.json() as LookupResult;
};
