"use client";

import { useEffect, useState } from "react";
import styles from "./book.module.css";

let diagramUid = 0;

let mermaidPromise: Promise<{ render: (id: string, code: string) => Promise<{ svg: string }> }> | null = null;

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      const mermaid = (mod.default ?? mod) as {
        initialize: (config: Record<string, unknown>) => void;
        render: (id: string, code: string) => Promise<{ svg: string }>;
      };
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "strict",
        fontFamily: "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

export default function Mermaid({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);

    (async () => {
      try {
        const mermaid = await getMermaid();
        const { svg: rendered } = await mermaid.render(`book-mmd-${++diagramUid}`, code);
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className={styles.diagramError}>
        <pre>
          <code>{code}</code>
        </pre>
        <p className={styles.diagramErrorNote}>Diagram could not be rendered.</p>
      </div>
    );
  }

  if (svg) {
    return <div className={styles.diagram} dangerouslySetInnerHTML={{ __html: svg }} />;
  }

  return <div className={styles.diagramLoading}>Rendering diagram…</div>;
}