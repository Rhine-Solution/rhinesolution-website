"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-end justify-center bg-[#2f2a44]/40 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-md rounded-2xl border-[3px] border-[var(--ink)] bg-card p-5 text-[var(--ink)] hard-shadow"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn-lift-sm flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[var(--ink)] bg-[var(--muted)] font-bold hard-shadow-sm"
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
