"use client";

import { QRCodeSVG } from "qrcode.react";

export function getBaseWebUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WEB_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  );
}

export function bottleVerifyUrl(qrToken: string) {
  const base = getBaseWebUrl().replace(/\/$/, "");
  return `${base}/verify?token=${encodeURIComponent(qrToken)}`;
}

export function QrCodeDisplay({ qrToken, size = 160 }: { qrToken: string; size?: number }) {
  return (
    <div className="inline-flex rounded-xl bg-white p-3">
      <QRCodeSVG value={bottleVerifyUrl(qrToken)} size={size} level="M" />
    </div>
  );
}