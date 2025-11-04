// app/page.tsx
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "Dato — Notes & Work",
  description: "Cyber–biz personal site with Zettelkasten notes.",
  alternates: { canonical: site },
  openGraph: {
    title: "Dato — Notes & Work",
    description: "Cyber–biz personal site with Zettelkasten notes.",
    url: site,
    siteName: "Dato Kavazi",
    images: [{ url: `${site}/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dato — Notes & Work",
    description: "Cyber–biz personal site with Zettelkasten notes.",
    images: [`${site}/og`],
  },
};

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Welcome</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Personal notes, projects, and thinking.
      </p>
    </div>
  );
}
