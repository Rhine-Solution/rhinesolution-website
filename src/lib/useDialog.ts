import { useEffect, useRef } from "react";

// Accessible dialog: initial focus, Tab trap, Escape to close, focus restore on close.
export function useDialog(open: boolean, onClose: () => void, label: string) {
  const ref = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", label);

    const focusables = () =>
      Array.from(el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )).filter((n) => n.offsetParent !== null);
    const first = () => focusables()[0];
    const last = () => focusables()[focusables().length - 1];
    first()?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const current = document.activeElement as HTMLElement;
      if (e.shiftKey && (current === f[0] || !el.contains(current))) {
        e.preventDefault();
        last()?.focus();
      } else if (!e.shiftKey && (current === f[f.length - 1] || !el.contains(current))) {
        e.preventDefault();
        first()?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      prevFocus.current?.focus();
    };
  }, [open, onClose, label]);

  return ref;
}