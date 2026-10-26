import type { IncomingMessage, ServerResponse } from "node:http";
import { readSettings } from "../server/content";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    return res.end();
  }
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const settings = await readSettings();
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        instagramUrl: settings.instagramUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        soundcloudUrl: settings.soundcloudUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
      })
    );
  } catch {
    res.statusCode = 503;
    return res.end(JSON.stringify({}));
  }
}
