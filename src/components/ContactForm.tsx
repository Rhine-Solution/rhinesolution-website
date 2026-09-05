"use client";

import { useState, type FormEvent } from "react";
import Turnstile from "./Turnstile";

type Status = "idle" | "submitting" | "success" | "error";

type ContactFormProps = {
  locale: string;
  labels: {
    name: string;
    email: string;
    message: string;
    submit: string;
    submitting: string;
    success: string;
    error_generic: string;
    verify_error: string;
  };
};

export default function ContactForm({ locale, labels }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const turnstileConfigured =
    typeof process !== "undefined" && Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    if (turnstileConfigured && !turnstileToken) {
      setErrorMsg(labels.verify_error);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, locale, turnstile: turnstileToken }),
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (data.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setTurnstileToken("");
      } else {
        setErrorMsg(data.error || labels.error_generic);
        setStatus("error");
      }
    } catch {
      setErrorMsg(labels.error_generic);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-form-success" role="status">
        <h3>{labels.success}</h3>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
      noValidate
      aria-busy={submitting}
    >
      <div className="contact-form-row">
        <label className="contact-form-label" htmlFor="cf-name">
          {labels.name}
        </label>
        <input
          id="cf-name"
          type="text"
          name="name"
          className="contact-form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
          disabled={submitting}
          autoComplete="name"
        />
      </div>
      <div className="contact-form-row">
        <label className="contact-form-label" htmlFor="cf-email">
          {labels.email}
        </label>
        <input
          id="cf-email"
          type="email"
          name="email"
          className="contact-form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={200}
          disabled={submitting}
          autoComplete="email"
        />
      </div>
      <div className="contact-form-row">
        <label className="contact-form-label" htmlFor="cf-message">
          {labels.message}
        </label>
        <textarea
          id="cf-message"
          name="message"
          className="contact-form-input"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={4000}
          disabled={submitting}
        />
      </div>
      {status === "error" && errorMsg && (
        <p className="contact-form-error" role="alert">
          {errorMsg}
        </p>
      )}
      {turnstileConfigured && (
        <div className="contact-form-turnstile">
          <Turnstile
            onToken={(t) => setTurnstileToken(t)}
            onExpired={() => setTurnstileToken("")}
            theme="dark"
          />
        </div>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
      >
        {submitting ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
