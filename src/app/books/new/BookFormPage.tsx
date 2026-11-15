"use client";
import { useRouter } from "next/navigation";
import { IsbnRegistration } from "@/components/book-form/IsbnRegistration";
import { liveIsbnLookup } from "@/lib/books/isbn-lookup.client";
import { bookAreas } from "@/lib/books/classification";
import { registerBook } from "@/lib/books/register-book.client";
export function BookFormPage() {
  const router = useRouter();
  return <IsbnRegistration tags={bookAreas} lookup={liveIsbnLookup} register={registerBook} sampleRegistration={false} notice="" onExit={(href) => router.push(href)} />;
}
