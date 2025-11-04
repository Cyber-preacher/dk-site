// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-fuchsia-500/30 selection:text-white">
        <Providers>
          <div className="relative">
            <div className="fixed inset-0 -z-10 bg-grid opacity-30" />
            <Nav />
            <main className="mx-auto max-w-5xl px-6 md:px-8 py-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
