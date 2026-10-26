import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { ENV } from "../server/_core/env";
import { submitContact } from "../server/content";
import { sendContactEmail } from "../server/contactEmail";

const MAX_BODY_BYTES = 16 * 1024;
const inputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(10).max(5000),
  company: z.string().max(200).optional(),
});

type VercelRequest = IncomingMessage & { body?: unknown };

async function parseBody(req: VercelRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8"));
    return req.body;
  }

  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > MAX_BODY_BYTES)
      throw new Error("Contact request is too large.");
    chunks.push(buffer);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function respond(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>
) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return respond(res, 405, { message: "Method not allowed." });
  }

  const contentLength = Number(req.headers["content-length"] ?? 0);
  if (contentLength > MAX_BODY_BYTES)
    return respond(res, 413, { message: "Contact request is too large." });

  let body: unknown;
  try {
    body = await parseBody(req);
  } catch {
    return respond(res, 400, { message: "Invalid contact request." });
  }

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success)
    return respond(res, 400, { message: "Check the contact form fields." });
  const input = parsed.data;
  if (input.company)
    return respond(res, 400, {
      message: "This submission could not be accepted.",
    });

  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      ?.split(",")[0]
      ?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const ipHash = createHash("sha256")
    .update(`${ENV.cookieSecret}:${ip}`)
    .digest("hex");
  const contact = {
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    ipHash,
  };

  try {
    await submitContact(contact);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Too many messages. Please try again later."
    )
      return respond(res, 429, { message: error.message });
    console.error("[Contact] Message persistence failed.");
    return respond(res, 503, {
      message: "We could not save your message. Please try again.",
    });
  }

  const emailDeliveryConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  const emailDelivered = await sendContactEmail(contact);
  return respond(res, 200, {
    stored: true,
    emailDeliveryConfigured,
    emailDelivered,
  });
}
