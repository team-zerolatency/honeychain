import crypto from "node:crypto";

// Excludes 0/O/1/I/L to avoid human transcription errors when someone reads this off a bottle label
const SCRATCH_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateQrToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function generateScratchCode(length = 10): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += SCRATCH_CHARSET[crypto.randomInt(SCRATCH_CHARSET.length)];
  }
  return code;
}

export function hashScratchCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}