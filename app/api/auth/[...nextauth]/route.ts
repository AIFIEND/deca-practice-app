// app/api/auth/[...nextauth]/route.ts
// NEW FILE: Handles NextAuth configuration, passing the is_admin flag from our backend into the session.

import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { BackendUser } from "@/types/next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/credentials`, {
            method: 'POST',
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" }
          });

          const user = await res.json();

          if (res.ok && user) {
            // The user object from our backend contains id, name, token, and is_admin
            return user;
          }
          return null;
        } catch (e) {
          console.error("Authorize error:", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // The `user` object is passed on the first sign-in.
      // We are casting it here to our BackendUser type.
      const backendUser = user as BackendUser;
      if (backendUser) {
        token.id = backendUser.id;
        token.backendToken = backendUser.token;
        token.is_admin = backendUser.is_admin; // Pass is_admin to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.backendToken = token.backendToken as string;
        session.user.is_admin = token.is_admin as boolean; // Pass is_admin to the session
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };