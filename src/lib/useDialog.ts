import { useEffect, useRef } from "react";

// Accessible dialog: focus trap, Escape to close, focus restore on close.
// All behavior is keyed on the `open` transition only — re-renders (typing,
// state updates) must NEVER steal focus back to the dialog's first element.
export function useDialog(open: boolean, onClose: () => void, label: string) {
  const ref = useRef<HTMLDivElement>(null);
  const prevOpen = useRef(false);
  const prevFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const labelRef = useRef(label);
  onCloseRef.current = onClose;
  labelRef.current = label;

  useEffect(() => {
    const wasOpen = prevOpen.current;
    prevOpen.current = open;
    if (!open) return; // no setup while closed (cleanup of the open run restores focus)

    const el = ref.current;
    if (!el) return;
    if (!wasOpen) {
      prevFocus.current = document.activeElement as HTMLElement | null;
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", labelRef.current);
    }

    const focusables = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((n) => n.offsetParent !== null);
    const first = () => focusables()[0];
    const last = () => focusables()[focusables().length - 1];

    // Only on the transition into open — never on later re-renders.
    if (!wasOpen) first()?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
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
      // Closing: return focus to whatever opened the dialog.
      if (wasOpen) prevFocus.current?.focus();
    };
  }, [open]);

  return ref;
}