import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isOwner } from "@/lib/auth/owner";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub({ authorization: { params: { scope: "read:user" } } })],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/signin", error: "/signin" },
  callbacks: {
    signIn({ account }) {
      return account?.provider === "github" && isOwner(account.providerAccountId);
    },
    jwt({ token, account }) {
      if (account) token.sub = account.provider === "github" ? account.providerAccountId : undefined;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = isOwner(token.sub) ? token.sub! : "";
      return session;
    },
  },
});
