import { useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { PageIntro, usePageMeta } from "@/components/SiteLayout";

export default function Contact() {
  const mutation = trpc.content.contact.useMutation();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  usePageMeta(
    "Contact MONTYX RECORDS Distribution",
    "Start a conversation with MONTYX RECORDS about music distribution, artist, rights or general enquiries."
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSent(false);
    const form = new FormData(event.currentTarget);
    try {
      await mutation.mutateAsync({
        name: String(form.get("name")),
        email: String(form.get("email")),
        subject: String(form.get("subject")),
        message: String(form.get("message")),
        company: String(form.get("company") || ""),
      });
      event.currentTarget.reset();
      setSent(true);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We couldn’t save your message. Please try again."
      );
    }
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
            Use the form for a direct message. Submissions are stored securely
            for the label team; email notifications are not currently
            configured.
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
              <b>Message saved.</b> It is in the label’s private inbox. Email
              forwarding is not configured, so this does not mean an email was
              sent.
            </div>
          )}
          {error && (
            <div className="notice notice-error" role="alert">
              {error}
            </div>
          )}
          <button
            className="button button-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Send message"} <span>↗</span>
          </button>
          <p className="form-note">
            Please don’t include passwords, private contracts or unreleased
            audio files.
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
