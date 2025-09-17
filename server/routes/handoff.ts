import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { HandoffRequestBody, HandoffResponse } from "@shared/api";

const LOG_DIR = path.join(process.cwd(), "server", "logs");
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}
function todayFile(prefix: string) {
  const d = new Date();
  const iso = d.toISOString().slice(0, 10);
  return path.join(LOG_DIR, `${prefix}-${iso}.jsonl`);
}
function maskPII(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => "<email>")
    .replace(/\b\+?\d[\d\s-]{7,}\b/g, () => "<phone>");
}

export const handleHandoff: RequestHandler = (req, res) => {
  const body = req.body as HandoffRequestBody | undefined;
  if (!body || !body.sessionId || !body.name) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    ensureLogDir();
    const line = JSON.stringify({
      t: new Date().toISOString(),
      type: "handoff",
      sessionId: body.sessionId,
      name: maskPII(body.name),
      email: body.email ? "<email>" : undefined,
      phone: body.phone ? "<phone>" : undefined,
      note: body.note ? maskPII(body.note) : undefined,
    });
    fs.appendFileSync(todayFile("handoff"), line + "\n", "utf8");
  } catch {}

  const response: HandoffResponse = { ok: true };
  res.json(response);
};
