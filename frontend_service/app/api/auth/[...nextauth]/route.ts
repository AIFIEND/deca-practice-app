// app/api/auth/[...nextauth]/route.ts
// NextAuth (Credentials) configured to call the Flask API via our helpers
// and to persist backendToken + is_admin on the session.

import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { postJson } from "@/lib/api";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // This runs on the server
      authorize: async (creds) => {
        try {
          const username = (creds?.username || "").trim();
          const password = creds?.password || "";

          if (!username || !password) return null;

          // Call Flask using our centralized helper (uses API_URL on server)
          const data = await postJson<{
            id: number;
            name: string;
            token: string;      // <-- Flask JWT
            is_admin: boolean;
          }>("/api/auth/credentials", { username, password });

          // Return the user object for NextAuth JWT
          return {
            id: String(data.id),
            name: data.name,
            backendToken: data.token,
            is_admin: data.is_admin,
          } as any;
        } catch (err: any) {
          // Wrong password, unknown user, or network error -> deny
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Copy fields onto the JWT at login
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.backendToken = (user as any).backendToken;
        token.is_admin = (user as any).is_admin;
      }
      return token;
    },
    // Expose them on the session so the UI can read them
    async session({ session, token }) {
      (session.user as any) = {
        id: token.id ?? (session.user as any)?.id,
        name: token.name ?? session.user?.name,
        backendToken: token.backendToken,
        is_admin: !!token.is_admin,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
