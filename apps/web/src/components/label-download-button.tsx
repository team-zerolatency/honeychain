"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@repo/ui/button";
import { bottleVerifyUrl } from "@/components/qr-code-display";
import { BottleLabelDocument } from "@/lib/pdf/bottle-label";

interface Bottle {
  bottleCode: string;
  qrToken: string;
  scratchCode: string;
}

export function LabelDownloadButton({ bottle }: { bottle: Bottle }) {
  const t = useTranslations("dashboard.harvests");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const qrDataUrl = canvas.toDataURL("image/png");

      const blob = await pdf(
        <BottleLabelDocument bottleCode={bottle.bottleCode} qrDataUrl={qrDataUrl} scratchCode={bottle.scratchCode} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bottle.bottleCode}-label.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      {/* Off-screen canvas — never visible, only read from for the PDF export */}
      <div className="hidden">
        <QRCodeCanvas ref={canvasRef} value={bottleVerifyUrl(bottle.qrToken)} size={300} level="M" />
      </div>
      <Button size="sm" variant="outline" disabled={isGenerating} onClick={handleDownload}>
        {isGenerating ? t("generatingLabel") : t("downloadLabel")}
      </Button>
    </>
  );
}