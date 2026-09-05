"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  locale?: string;
};

const WELCOME =
  "Hi! I'm the Rhine Solution assistant. Ask me about the studio, our projects, the team, or how to get in touch.";

const NAV_TOKEN = /\[navigate:([^\]]+)\]/g;

function stripNavTokens(text: string): string {
  return text.replace(NAV_TOKEN, "").trim();
}

export default function ChatWidget({ locale: propLocale }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const locale = propLocale ?? "en";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const history = [...messages, { role: "user" as const, content: text }];
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 30000);
    let fullText = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          locale,
          currentPath: pathname ?? "/",
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });

        const lines = acc.split("\n");
        acc = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") {
            reader.cancel().catch(() => {});
            break;
          }
          try {
            const json = JSON.parse(payload);
            const delta =
              json.choices?.[0]?.delta?.content ??
              json.candidates?.[0]?.content?.parts
                ?.map((p: { text?: string }) => p.text ?? "")
                .join("") ??
              "";
            if (delta) {
              fullText += delta;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "assistant",
                  content: (next[next.length - 1].content || "") + delta,
                };
                return next;
              });
            }
          } catch {
            // ignore incomplete/partial JSON lines
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't reach the assistant right now. Please try again.",
        };
        return next;
      });
    } finally {
      clearTimeout(abortTimer);
      setBusy(false);
      if (fullText) {
        const matches = [...fullText.matchAll(NAV_TOKEN)];
        const clean = stripNavTokens(fullText);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: clean || WELCOME,
          };
          return next;
        });
        const token = matches[matches.length - 1]?.[1];
        if (token) {
          let target = token.startsWith("/") ? token : `/${token}`;
          if (target.startsWith(`/${locale}/`) || target === `/${locale}`) {
            // already locale-prefixed
          } else if (target === "/") {
            target = `/${locale}`;
          } else {
            target = `/${locale}${target}`;
          }
          setTimeout(() => router.push(target), 400);
        }
      }
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Rhine Solution">
          <div className="chat-panel-head">
            <span className="chat-panel-title">
              <FiMessageSquare size={16} aria-hidden="true" />
              Rhine Solution Assistant
            </span>
            <button
              type="button"
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="chat-messages" ref={scrollRef} aria-live="polite" role="log">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.role}`}>
                {m.content || "…"}
              </div>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              className="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Rhine Solution…"
              aria-label="Chat message"
              autoComplete="off"
            />
            <button
              type="submit"
              className="chat-send"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <FiX size={22} /> : <FiMessageSquare size={22} />}
      </button>
    </div>
  );
}