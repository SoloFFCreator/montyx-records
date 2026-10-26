import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { renderSeoDocument } from "../server/_core/seo";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const requestUrl = new URL(req.url ?? "/", "http://request.invalid");
  const requestedPath = requestUrl.searchParams.get("path") ?? "/";
  if (
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//") ||
    requestedPath.includes("\\") ||
    requestedPath.includes("\0") ||
    requestedPath.length > 2048
  ) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Invalid page path");
  }

  try {
    const template = await readFile(
      resolve(process.cwd(), "dist/public/index.html"),
      "utf8"
    );
    const page = await renderSeoDocument(template, requestedPath);
    res.statusCode = page.status;
    res.setHeader("Cache-Control", "public, max-age=0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(page.html);
  } catch {
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Page temporarily unavailable");
  }
}
