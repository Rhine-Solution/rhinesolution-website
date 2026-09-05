"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX, FiFolder, FiFile } from "react-icons/fi";
import type { BrainManifest, BrainTreeNode } from "@/lib/brain";
import styles from "./brain.module.css";

type Props = {
  manifest: BrainManifest;
  locale: string;
  labels: Record<string, string>;
  active?: string;
};

export default function BrainSidebar({ manifest, locale, labels, active }: Props) {
  const [open, setOpen] = useState(false);
  const label = (name: string) => labels[name.toLowerCase()] ?? name;

  function renderTree(node: BrainTreeNode, depth: number) {
    const hasNotes = node.notes.length > 0;
    return (
      <li key={`${node.name}-${depth}`}>
        {hasNotes && (
          <span className={styles.treeFolderName} style={{ paddingLeft: depth * 14 }}>
            <FiFolder size={14} aria-hidden="true" /> {node.name === "Brain" ? label("brain") : label(node.name)}
          </span>
        )}
        {node.notes.length > 0 && (
          <ul className={styles.treeList}>
            {node.notes.map((slug) => {
              const note = manifest.notes[slug];
              if (!note) return null;
              return (
                <li key={note.slug}>
                  <Link
                    href={`/${locale}/projects/brain/${note.slug}`}
                    className={`${styles.treeLink} ${active === note.slug ? styles.treeLinkActive : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <FiFile size={13} aria-hidden="true" /> {note.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {node.folders.length > 0 && (
          <ul className={styles.treeList}>
            {node.folders.map((folder) => renderTree(folder, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <>
      <button type="button" className={styles.treeToggle} onClick={() => setOpen(true)} aria-label="Open brain menu">
        <FiMenu size={18} aria-hidden="true" /> <span>{labels.browse}</span>
      </button>
      <div className={`${styles.tree} ${open ? styles.treeOpen : ""}`}>
        <button type="button" className={styles.treeClose} onClick={() => setOpen(false)} aria-label="Close brain menu">
          <FiX size={18} aria-hidden="true" />
        </button>
        <nav aria-label="Brain notes">
          <ul className={styles.treeList}>
            {(manifest.tree ?? []).map((node) => renderTree(node, 0))}
          </ul>
        </nav>
      </div>
      {open && <button type="button" className={styles.treeOverlay} onClick={() => setOpen(false)} aria-label="Close" />}
    </>
  );
}
