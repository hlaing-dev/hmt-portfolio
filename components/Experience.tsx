"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { profile, sections, type SectionId } from "@/content/profile";
import { SectionContent } from "./ui/SectionContent";
import { Ambient } from "./ambient";

const Scene = dynamic(() => import("./scene/Scene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const TOTAL = sections.length + 1; // overview + sections
const pad = (n: number) => String(n).padStart(2, "0");

export function Experience() {
  const [focus, setFocus] = useState<SectionId | null>(null);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [panelSide, setPanelSide] = useState<"right" | "bottom">("right");
  const lastWheel = useRef(0);
  const [soundOn, setSoundOn] = useState(false);
  const ambient = useRef<Ambient | null>(null);

  // Background music: off by default. If the visitor turned it on before, it
  // comes back on their first tap/click (browsers block audio until then).
  useEffect(() => {
    let wanted = false;
    try {
      wanted = localStorage.getItem("sky-sound") === "on";
    } catch {
      /* storage unavailable */
    }
    if (!wanted) return;
    const resume = () => setSoundOn(true);
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  useEffect(() => {
    if (!soundOn) {
      ambient.current?.stop();
      return;
    }
    ambient.current ??= new Ambient();
    ambient.current.start();
    const onVisibility = () => ambient.current?.setSuspended(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [soundOn]);

  useEffect(() => () => ambient.current?.stop(), []);

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on;
      try {
        localStorage.setItem("sky-sound", next ? "on" : "off");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  useEffect(() => {
    setWebgl(hasWebGL());
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 760px)");
    const sync = () => {
      setReducedMotion(rm.matches);
      setPanelSide(narrow.matches ? "bottom" : "right");
    };
    sync();
    rm.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      rm.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  const index = focus ? sections.findIndex((s) => s.id === focus) + 1 : 0;

  const goTo = useCallback((i: number) => {
    const n = (i + TOTAL) % TOTAL;
    setFocus(n === 0 ? null : sections[n - 1].id);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setFocus((cur) => {
        const i = cur ? sections.findIndex((s) => s.id === cur) + 1 : 0;
        const n = Math.min(TOTAL - 1, Math.max(0, i + dir));
        return n === 0 ? null : sections[n - 1].id;
      });
    },
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocus(null);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") step(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(-1);
    };
    // Scrolling over the world moves through the journey (not over the panel).
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest(".panel, .board")) return;
      const now = performance.now();
      if (Math.abs(e.deltaY) < 24 || now - lastWheel.current < 1100) return;
      lastWheel.current = now;
      step(e.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [step]);

  const active = sections.find((s) => s.id === focus);

  return (
    <main className="world">
      <div className="sky" aria-hidden />

      {webgl && (
        <div className="canvas-wrap">
          <Scene
            focus={focus}
            onSelect={setFocus}
            onClear={() => setFocus(null)}
            panelSide={panelSide}
            reducedMotion={reducedMotion}
            paused={paused}
            onReady={() => setReady(true)}
          />
        </div>
      )}

      <div className={`loader${ready || webgl === false ? " loader--done" : ""}`} aria-hidden>
        <div className="loader__cloud" />
        <span>Gathering the clouds…</span>
      </div>

      <header className="topbar">
        <button type="button" className="brand" onClick={() => setFocus(null)}>
          <span className="brand__mark" aria-hidden>
            ☁︎
          </span>
          <span>
            <span className="brand__name">{profile.name}</span>
            <span className="brand__role">{profile.role}</span>
          </span>
        </button>
        <Link href="/classic" className="ghost-btn">
          Classic view
        </Link>
      </header>

      <section className={`intro${focus ? " intro--hidden" : ""}`} aria-hidden={!!focus}>
        <p className="eyebrow">Welcome to the sky village</p>
        <h1>{profile.headline}</h1>
        <p className="intro__sub">
          {profile.years}+ years across web, mobile and cloud. Based in {profile.location}.
        </p>
        <div className="intro__actions">
          <button type="button" className="cta-btn" onClick={() => goTo(1)}>
            Begin the tour
          </button>
          <span className="intro__hint">
            {webgl === false ? "3D is unavailable, use the classic view." : "or scroll, drag, click a place"}
          </span>
        </div>
      </section>

      <nav className="rail" aria-label="Sections">
        <span className="rail__count">
          {pad(index + 1)} <i>/ {pad(TOTAL)}</i>
        </span>
        <ol>
          {[{ id: null as SectionId | null, label: "Welcome" }, ...sections].map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                className={`rail__dot${i === index ? " rail__dot--active" : ""}`}
                onClick={() => goTo(i)}
                aria-current={i === index ? "step" : undefined}
              >
                <span className="rail__label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="rail__scroll" aria-hidden>
          <i />
          Scroll
        </span>
      </nav>

      <nav className="dock" aria-label="Sections (mobile)">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`dock__item${focus === s.id ? " dock__item--active" : ""}`}
            onClick={() => setFocus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="controls">
        <button type="button" onClick={() => setFocus(null)} aria-label="Reset view" title="Reset view">
          ↺
        </button>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume motion" : "Pause motion"}
          title={paused ? "Resume motion" : "Pause motion"}
        >
          {paused ? "▶" : "❚❚"}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Turn music off" : "Turn music on"}
          title={soundOn ? "Music off" : "Music on"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
            {soundOn ? (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </>
            ) : (
              <path d="m16 9 6 6m0-6-6 6" />
            )}
          </svg>
        </button>
      </div>

      {active && (
        <aside className={`panel panel--${panelSide}`} aria-labelledby="panel-title" key={active.id}>
          <div className="panel__head">
            <div>
              <p className="eyebrow">
                {pad(index)} · {active.place}
              </p>
              <h2 id="panel-title">{active.label}</h2>
            </div>
            <div className="panel__actions">
              <button type="button" onClick={() => step(-1)} aria-label="Previous section">
                ←
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next section" disabled={index === TOTAL - 1}>
                →
              </button>
              <button type="button" onClick={() => setFocus(null)} aria-label="Close and return to overview">
                ✕
              </button>
            </div>
          </div>
          <div className="panel__body">
            <SectionContent id={active.id} />
          </div>
        </aside>
      )}
    </main>
  );
}
