import { BookFormPage } from "./BookFormPage";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { authConfigured, isLocalDevelopment, isOwner } from "@/lib/auth/owner";

export default async function NewBookPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const local = isLocalDevelopment(new URL(`http://${host || "invalid"}`));
  if (!local && (!authConfigured() || !isOwner((await auth())?.user?.id))) redirect("/signin");
  return <main>
    {!local && <form action={async () => {
      "use server";
      await signOut({ redirectTo: "/signin" });
    }}><button type="submit">ログアウト</button></form>}
    <BookFormPage />
  </main>;
}
