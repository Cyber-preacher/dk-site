// app/page.tsx
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "Dato — Notes & Work",
  description:
    "Entrepreneur and systems-builder across decentralized networks, neurotech, and planetary governance.",
  alternates: { canonical: site },
  openGraph: {
    title: "Dato — Notes & Work",
    description: "Public library of thoughts.",
    url: site,
    siteName: "Dato Kavazi",
    images: [{ url: `${site}/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dato — Notes & Work",
    description: "Public library of thoughts.",
    images: [`${site}/og`],
  },
};

export default function HomePage() {
  return (
    <div>
      <section className="cp-panel p-6 sm:p-8">
        <p className="cp-subtitle text-base sm:text-lg">
          I&apos;m Dato Kavazi - an entrepreneur and systems-builder working at
          the intersection of decentralized networks, neurotech and planetary
          governance.
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-3xl leading-none">Experience</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm sm:text-base">
              <li>Co-founder, Humanode (Aug 2020-present)</li>
              <li>Founder, Paradigm (Feb 2013-present)</li>
              <li>CSO, Citadel.One (Nov 2018-Sep 2020)</li>
              <li>CEO, Ilpontemarmi (Nov 2015-Feb 2017)</li>
              <li>COO, Prodano (started Nov 2014-Nov 2015)</li>
              <li>CFO, Follow The Future Capital (Sep 2012-Nov 2015)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl leading-none">Languages</h2>
            <p className="mt-3 text-sm sm:text-base">
              English (native), Russian (native), Georgian (native), Spanish
              (C2), Japanese (B2), Chinese (A2).
            </p>
          </div>

          <div>
            <h2 className="text-3xl leading-none">Interests</h2>
            <p className="mt-3 text-sm sm:text-base">
              What I study: cybernetics, computer sciences, neurosciences,
              robotics, astronomy, physics, philosophy, and adjacent systems
              disciplines.
            </p>
            <p className="mt-2 text-sm sm:text-base">
              Creative work: writing (books, short stories, film/series
              scripts), painting, and music. I play multiple styles of guitar,
              piano, some drums, and completed formal vocal training.
            </p>
            <p className="mt-2 text-sm sm:text-base">
              Sports: fitness, MMA, archery, historical fencing.
            </p>
          </div>

          <div>
            <h2 className="text-3xl leading-none">Favorites</h2>
            <p className="mt-3 text-sm sm:text-base">
              Authors: Fyodor Dostoyevsky, Ernest Hemingway, George R. R.
              Martin, Mikhail Lermontov, William Shakespeare, Gabriel Garcia
              Marquez, Alexandre Dumas, Marcus Aurelius, Charles Dickens.
            </p>
            <p className="mt-2 text-sm sm:text-base">
              Films: Gladiator, Interstellar, A Knight&apos;s Tale, Braveheart,
              Master and Commander: The Far Side of the World, Kingdom of
              Heaven, Troy, Hacksaw Ridge, V for Vendetta, Fight Club.
            </p>
            <p className="mt-2 text-sm sm:text-base">
              Music: Linkin Park, SOAD, Evanesence, Nightwish, Bring Me The
              Horizon, Woodkid, Disturbed, Adele, David Kushner and so much
              more.
            </p>
            <p className="mt-2 text-sm sm:text-base">
              Games: Paradox Interactive grand-strategy titles; Dark Souls III;
              Elden Ring.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
