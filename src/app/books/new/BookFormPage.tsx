"use client";
import { useRouter } from "next/navigation";
import { IsbnRegistration } from "@/components/book-form/IsbnRegistration";
import { liveIsbnLookup } from "@/lib/books/isbn-lookup.client";
import { bookAreas } from "@/lib/books/classification";
import { registerBook } from "@/lib/books/register-book.client";
export function BookFormPage() {
  const router = useRouter();
  return <IsbnRegistration tags={bookAreas} lookup={liveIsbnLookup} register={registerBook} sampleRegistration={false} notice="ISBNで情報を取得し、確認して登録します。分野・検索語は任意です。" onExit={(href) => router.push(href)} />;
}
