"use client";
import { useRouter } from "next/navigation";
import { BookFormScreen } from "@/components/book-form/BookFormScreen";
import { shelfTags } from "@/components/bookshelf/bookshelf.fixtures";
export function BookFormPage() {
  const router = useRouter();
  return <BookFormScreen tags={shelfTags} onExit={(href) => router.push(href)} />;
}
