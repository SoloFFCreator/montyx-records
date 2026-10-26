import { afterEach, describe, expect, it, vi } from "vitest";
import { sendContactEmail } from "./contactEmail";

const input = {
  name: "Test Artist",
  email: "artist@example.com",
  subject: "Release question",
  message: "Please let me know how to share a release.",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Resend contact notification", () => {
  it("does not attempt delivery without a server-side API key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const request = vi.fn();
    vi.stubGlobal("fetch", request);

    await expect(sendContactEmail(input)).resolves.toBe(false);
    expect(request).not.toHaveBeenCalled();
  });

  it("sends only to the configured support address and uses the sender as reply-to", async () => {
    vi.stubEnv("RESEND_API_KEY", "resend-test-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "MONTYX <verified@montyxlabel.cyou>");
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_test_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", request);

    await expect(sendContactEmail(input)).resolves.toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    const [url, options] = request.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((options.headers as Record<string, string>).Authorization).toBe(
      "Bearer resend-test-key"
    );
    const payload = JSON.parse(String(options.body));
    expect(payload.to).toEqual(["support@montyxlabel.cyou"]);
    expect(payload.reply_to).toBe(input.email);
    expect(payload.text).toContain(input.message);
  });

  it("reports provider rejection as not delivered", async () => {
    vi.stubEnv("RESEND_API_KEY", "resend-test-key");
    const request = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 403 }));
    vi.stubGlobal("fetch", request);

    await expect(sendContactEmail(input)).resolves.toBe(false);
  });
});
