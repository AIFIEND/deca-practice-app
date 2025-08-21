// app/api/auth/[...nextauth]/route.ts
// NEW FILE: Handles NextAuth configuration, passing the is_admin flag from our backend into the session.

import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { BackendUser } from "@/types/next-auth";
import { apiUrl } from "@/lib/api";


export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
async authorize(credentials) {
  if (!credentials?.username || !credentials?.password) return null;

  // Build the backend URL from the env var (no hardcoded IP)
  const loginEndpoint = apiUrl("/api/auth/credentials");

  // Send the login to your Flask backend
const res = await fetch(loginEndpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: credentials.username,
    password: credentials.password,
  }),
});

if (res.ok) {
  const user = await res.json(); // <- parse JSON directly now
  if (user) return user;
}
return null;


  // Read body as text first (so we can log even if it's not valid JSON)
  const text = await res.text();

  // Try to parse JSON after logging
  let user: any = null;
  try { user = JSON.parse(text); } catch {}

  // If backend said OK and returned a user object, accept the login
  if (res.ok && user) return user;

  // Otherwise, reject the login
  return null;
}

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