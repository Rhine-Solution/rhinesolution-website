"use client";

import { useEffect, useRef } from "react";

/**
 * SectionDivider — full-viewport scroll-revealed divider with a giant
 * bold visual (number + tagline). Pure CSS, no new deps.
 */
export default function SectionDivider({
  number,
  eyebrow,
  text,
}: {
  number: string;
  eyebrow: string;
  text: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("section-divider-in");
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="section-divider" aria-hidden="true">
      <div className="section-divider-inner">
        <span className="section-divider-number">{number}</span>
        <div className="section-divider-text">
          <span className="section-divider-eyebrow">{eyebrow}</span>
          <span className="section-divider-headline">{text}</span>
        </div>
      </div>
    </div>
  );
}
