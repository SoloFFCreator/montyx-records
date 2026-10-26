import { useState, type FormEvent } from "react";
import { PageIntro, usePageMeta } from "@/components/SiteLayout";

export default function Contact() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  usePageMeta(
    "Contact MONTYX RECORDS Distribution",
    "Start a conversation with MONTYX RECORDS about music distribution, artist, rights or general enquiries."
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);
    setEmailConfigured(false);
    setEmailSent(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name")),
          email: String(form.get("email")),
          subject: String(form.get("subject")),
          message: String(form.get("message")),
          company: String(form.get("company") || ""),
        }),
      });
      const result = (await response.json()) as {
        stored?: boolean;
        emailDeliveryConfigured?: boolean;
        emailDelivered?: boolean;
        message?: string;
      };
      if (!response.ok || result.stored !== true)
        throw new Error(
          result.message || "We couldn’t save your message. Please try again."
        );
      formElement.reset();
      setEmailConfigured(Boolean(result.emailDeliveryConfigured));
      setEmailSent(Boolean(result.emailDelivered));
      setSent(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We couldn’t save your message. Please try again."
      );
    } finally {
      setPending(false);
    }
  }
  function openEmailDraft(formElement: HTMLFormElement | null) {
    if (!formElement || !formElement.reportValidity()) return;
    const form = new FormData(formElement);
    const subject = String(form.get("subject") || "MONTYX RECORDS enquiry");
    const body = [
      `Name: ${String(form.get("name") || "")}`,
      `Reply email: ${String(form.get("email") || "")}`,
      "",
      String(form.get("message") || ""),
    ].join("\n");
    const query = new URLSearchParams({ subject, body });
    window.location.href = `mailto:support@montyxlabel.cyou?${query.toString()}`;
  }
  return (
    <main>
      <PageIntro
        kicker="GET IN TOUCH"
        title="Start a conversation."
        intro="For music distribution, artist, rights, or general enquiries, send a note to the label."
      />
      <section className="contact-layout content-width">
        <div className="contact-copy">
          <span className="eyebrow red">MONTYX RECORDS · NEPAL</span>
          <h2>Good work starts with a clear conversation.</h2>
          <p>
            Your message is saved first. When server email delivery is
            unavailable, use the email-draft button to contact the label from
            your mail app.
          </p>
          <div className="contact-address">
            <span className="eyebrow">SUPPORT EMAIL</span>
            <a href="mailto:support@montyxlabel.cyou">
              support@montyxlabel.cyou ↗
            </a>
          </div>
          <LinkRights />
        </div>
        <form className="contact-form" onSubmit={submit}>
          <label>
            Name
            <input name="name" autoComplete="name" required maxLength={160} />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={320}
            />
          </label>
          <label>
            Subject
            <input name="subject" required maxLength={200} />
          </label>
          <label>
            Message
            <textarea
              name="message"
              rows={7}
              required
              minLength={10}
              maxLength={5000}
            />
          </label>
          <label className="honeypot" aria-hidden="true">
            Company
            <input name="company" tabIndex={-1} autoComplete="off" />
          </label>
          {sent && (
            <div className="notice notice-success" role="status">
              <b>{emailSent ? "Message emailed." : "Message saved only."}</b>{" "}
              {emailSent
                ? "The contact service accepted the email for delivery."
                : emailConfigured
                  ? "The email provider did not accept it. Use the email draft below to contact support."
                  : "Automatic email is not configured; it was not sent to support. Use the email draft below."}
            </div>
          )}
          {error && (
            <div className="notice notice-error" role="alert">
              {error}
            </div>
          )}
          <button className="button button-primary" disabled={pending}>
            {pending ? "Saving…" : "Send message"} <span>↗</span>
          </button>
          <button
            type="button"
            className="button button-outline"
            onClick={event => openEmailDraft(event.currentTarget.form)}
          >
            Open email draft
          </button>
          <p className="form-note">
            The draft opens your mail app; review it and tap Send. Please don’t
            include passwords, private contracts or unreleased audio files.
          </p>
        </form>
      </section>
    </main>
  );
}

function LinkRights() {
  return (
    <div className="contact-address">
      <span className="eyebrow">RIGHTS & TAKEDOWNS</span>
      <a href="/rights">Read the rights policy ↗</a>
    </div>
  );
}
