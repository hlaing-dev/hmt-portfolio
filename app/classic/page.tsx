import type { Metadata } from "next";
import Link from "next/link";
import { profile, sections } from "@/content/profile";
import { SectionContent } from "@/components/ui/SectionContent";

export const metadata: Metadata = {
  title: `${profile.name} · Classic view`,
  description: profile.summary,
};

/** Fully server-rendered, no-WebGL version: fast to scan, good for SEO and screen readers. */
export default function Classic() {
  return (
    <main className="classic">
      <header className="classic__hero">
        <Link href="/" className="ghost-btn">
          ← Back to the island
        </Link>
        <p className="eyebrow">
          {profile.role} · {profile.location}
        </p>
        <h1>{profile.name}</h1>
        <p className="classic__headline">{profile.headline}</p>
        <nav aria-label="Sections" className="classic__nav">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        </nav>
      </header>
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="classic__section">
          <h2>{s.label}</h2>
          <SectionContent id={s.id} expanded />
        </section>
      ))}
      <footer className="classic__footer">© {new Date().getFullYear()} {profile.name}</footer>
    </main>
  );
}
