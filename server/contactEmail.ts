const SUPPORT_EMAIL = "support@montyxlabel.cyou";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Returns true only when Resend accepts the email and returns an email ID. */
export async function sendContactEmail(
  input: ContactEmailInput
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `MONTYX RECORDS <${SUPPORT_EMAIL}>`;
  const safeSubject = input.subject.replace(/[\r\n]+/g, " ").slice(0, 200);
  const text = [
    "A new contact-form message was submitted on montyxlabel.cyou.",
    "",
    `Name: ${input.name}`,
    `Reply email: ${input.email}`,
    `Subject: ${safeSubject}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [SUPPORT_EMAIL],
        reply_to: input.email,
        subject: `[MONTYX website] ${safeSubject}`,
        text,
      }),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      console.warn(`[Contact] Resend returned HTTP ${response.status}.`);
      return false;
    }

    const result: unknown = await response.json();
    return (
      typeof result === "object" &&
      result !== null &&
      "id" in result &&
      typeof result.id === "string" &&
      result.id.length > 0
    );
  } catch {
    // Keep provider errors and message content out of logs; the saved request remains.
    console.warn("[Contact] Resend request failed; message remains saved.");
    return false;
  }
}
