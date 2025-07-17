// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextAuthProvider from "@/context/NextAuthProvider";
import { Navbar } from "@/components/Navbar"; // This is the line we're fixing
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DECA Practice Review",
  description: "An application to practice for the DECA exam.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <Toaster />
          <Navbar />
          <main className="max-w-7xl mx-auto p-4">
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}