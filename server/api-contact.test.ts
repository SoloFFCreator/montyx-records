import { createServer } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../api/contact";
import { submitContact } from "./content";
import { sendContactEmail } from "./contactEmail";

vi.mock("../server/content", () => ({
  submitContact: vi.fn(),
}));
vi.mock("../server/contactEmail", () => ({
  sendContactEmail: vi.fn(),
}));

const validPayload = {
  name: "Test listener",
  email: "listener@example.com",
  subject: "Distribution question",
  message: "Please share information about your distribution service.",
  company: "",
};

async function postContact(body: unknown) {
  const server = createServer((req, res) => {
    void handler(req, res);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("No test server address");
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/contact`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    return {
      response,
      json: (await response.json()) as Record<string, unknown>,
    };
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
}

beforeEach(() => {
  vi.mocked(submitContact).mockReset().mockResolvedValue(undefined);
  vi.mocked(sendContactEmail).mockReset().mockResolvedValue(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("standalone Vercel contact endpoint", () => {
  it("persists before sending and reports when Resend accepts the message", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    const { response, json } = await postContact(validPayload);
    expect(response.status).toBe(200);
    expect(json).toEqual({
      stored: true,
      emailDeliveryConfigured: true,
      emailDelivered: true,
    });
    expect(submitContact).toHaveBeenCalledTimes(1);
    expect(sendContactEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(submitContact).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(sendContactEmail).mock.invocationCallOrder[0]
    );
    expect(submitContact).toHaveBeenCalledWith(
      expect.objectContaining({
        name: validPayload.name,
        email: validPayload.email,
        subject: validPayload.subject,
        message: validPayload.message,
        ipHash: expect.any(String),
      })
    );
    expect(submitContact.mock.calls[0][0]).not.toHaveProperty("company");
  });

  it("keeps the saved message and truthfully reports provider rejection", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.mocked(sendContactEmail).mockResolvedValue(false);
    const { response, json } = await postContact(validPayload);
    expect(response.status).toBe(200);
    expect(json).toEqual({
      stored: true,
      emailDeliveryConfigured: true,
      emailDelivered: false,
    });
  });

  it("rejects invalid submissions before saving or sending", async () => {
    const { response } = await postContact({ ...validPayload, email: "bad" });
    expect(response.status).toBe(400);
    expect(submitContact).not.toHaveBeenCalled();
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  it("does not attempt email when Supabase persistence fails", async () => {
    vi.mocked(submitContact).mockRejectedValue(
      new Error("database unavailable")
    );
    const { response, json } = await postContact(validPayload);
    expect(response.status).toBe(503);
    expect(json).toEqual({
      message: "We could not save your message. Please try again.",
    });
    expect(sendContactEmail).not.toHaveBeenCalled();
  });
});
