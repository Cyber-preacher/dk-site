import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Rajdhani, Teko } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";
import { getSiteUrl } from "@/lib/site";

const bodyFont = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Teko({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Dato Kavazi — Notes & Work",
  description: "Public library of thoughts.",
  metadataBase: new URL(getSiteUrl()),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <Providers>
          <div className="cp-app">
            <Nav />
            <main className="mx-auto max-w-5xl px-4 pb-16 pt-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
