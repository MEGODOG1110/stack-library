import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { authConfigured, isOwner } from "@/lib/auth/owner";

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  const configured = authConfigured();
  if (configured && isOwner((await auth())?.user?.id)) redirect("/books/new");
  const { error } = await searchParams;
  return <main>
    <h1>本を登録するにはログインしてください</h1>
    <p>書籍の登録は、この本棚の所有者だけが利用できます。</p>
    {error && <p role="alert">ログインできませんでした。本棚の所有者のGitHubアカウントで再度お試しください。</p>}
    {configured ? <form action={async () => {
      "use server";
      await signIn("github", { redirectTo: "/books/new" });
    }}><button type="submit">GitHubでログイン</button></form> : <p role="status">ログイン設定を準備しています。まだ登録はできません。</p>}
    <Link href="/">本棚に戻る</Link>
  </main>;
}
