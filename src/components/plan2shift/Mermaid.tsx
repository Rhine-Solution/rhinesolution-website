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
        theme: "base",
        securityLevel: "strict",
        fontFamily: "'Rijksoverheid Sans', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        themeVariables: {
          background: "transparent",
          primaryColor: "#0d1830",
          primaryBorderColor: "#7EA7FF",
          primaryTextColor: "#F2F5FF",
          secondaryColor: "#0a1226",
          secondaryBorderColor: "#4a6db3",
          secondaryTextColor: "#F2F5FF",
          tertiaryColor: "#1a2640",
          tertiaryBorderColor: "#C4A882",
          tertiaryTextColor: "#F8F5F0",
          lineColor: "#7EA7FF",
          textColor: "#F2F5FF",
          nodeBorder: "#4a6db3",
          clusterBkg: "#0d1830",
          clusterBorder: "#7EA7FF",
          titleColor: "#C4A882",
          edgeLabelBackground: "#0a1226",
          fontSize: "14px",
          cScale0: "#2C6BFF",
          cScale1: "#7EA7FF",
          cScale2: "#C4A882",
          cScale3: "#4a6db3",
          cScale4: "#e8d5c4",
          cScale5: "#3A4848",
          cScale6: "#1a2640",
        },
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