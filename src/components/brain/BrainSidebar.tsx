"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX, FiFolder, FiFile } from "react-icons/fi";
import type { BrainManifest } from "@/lib/brain";
import styles from "./brain.module.css";

type Props = {
  manifest: BrainManifest;
  locale: string;
  labels: Record<string, string>;
  active?: string;
};

export default function BrainSidebar({ manifest, locale, labels, active }: Props) {
  const [open, setOpen] = useState(false);
  const folders = manifest.folders
    .map((f) => ({ ...f, notes: f.notes.map((s) => manifest.notes[s]).filter(Boolean) }))
    .filter((f) => f.notes.length > 0);

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
          {folders.map((folder) => (
            <section key={folder.id} className={styles.treeFolder}>
              <h2 className={styles.treeFolderTitle}>
                <FiFolder size={14} aria-hidden="true" /> {labels[folder.id] ?? folder.id}
              </h2>
              <ul className={styles.treeList}>
                {folder.notes.map((note) => (
                  <li key={note.slug}>
                    <Link
                      href={`/${locale}/projects/brain/${note.slug}`}
                      className={`${styles.treeLink} ${active === note.slug ? styles.treeLinkActive : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      <FiFile size={13} aria-hidden="true" /> {note.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
      {open && <button type="button" className={styles.treeOverlay} onClick={() => setOpen(false)} aria-label="Close" />}
    </>
  );
}
