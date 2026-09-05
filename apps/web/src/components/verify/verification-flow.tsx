"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ScratchVerifySchema, type ScratchVerifyInput, type VerificationResult } from "@repo/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/form";
import { GlassPanel } from "@repo/ui/glass-panel";
import { Card } from "@repo/ui/card";
import { HexCard } from "@repo/ui/hex-card";
import { QrCodeIcon } from "@/components/icons/qr-code-icon";

type Stage = "start" | "scanning" | "scratch" | "result";

const OUTCOME_COLOR: Record<string, string> = {
  GREEN: "text-verify-green",
  YELLOW: "text-verify-yellow",
  RED: "text-verify-red",
};

export function VerificationFlow() {
  const t = useTranslations("verify");
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("start");
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setQrToken(tokenFromUrl);
      setStage("scratch");
    }
  }, [searchParams]);

  const tokenQuery = useQuery({
    queryKey: ["verify-token", qrToken],
    queryFn: () => apiFetch<{ bottleCode: string; tokenValid: boolean }>(`/verify/${qrToken}`),
    enabled: !!qrToken && stage === "scratch",
    retry: false,
  });

  const scratchForm = useForm<ScratchVerifyInput>({
    resolver: zodResolver(ScratchVerifySchema),
    defaultValues: { qrToken: "", scratchCode: "" },
  });

  useEffect(() => {
    if (qrToken) scratchForm.setValue("qrToken", qrToken);
  }, [qrToken, scratchForm]);

  const verifyMutation = useMutation({
    mutationFn: (input: ScratchVerifyInput) =>
      apiFetch<VerificationResult>("/verify/scratch", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (data) => {
      setResult(data);
      setStage("result");
    },
  });

  function handleScan(detectedCodes: { rawValue: string }[]) {
    const raw = detectedCodes[0]?.rawValue;
    if (!raw) return;
    try {
      const url = new URL(raw);
      setQrToken(url.searchParams.get("token") ?? raw);
    } catch {
      setQrToken(raw); // scanned value wasn't a full URL — treat it as the raw token
    }
    setStage("scratch");
  }

  const [cameraError, setCameraError] = useState<string | null>(null);

  function reset() {
    setStage("start");
    setQrToken(null);
    setResult(null);
    setCameraError(null);
    scratchForm.reset();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      {stage === "start" && (
        <Card className="p-6 md:p-7">
          <HexCard className="flex flex-col gap-4 p-8">
            <h1 className="font-display text-2xl font-medium">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
            <button
              type="button"
              className="touch-manipulation flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-accent px-6 py-3.5 text-base font-medium text-white shadow-sm transition-all hover:bg-accent-strong active:scale-[0.99]"
              onClick={() => {
                setCameraError(null);
                setStage("scanning");
              }}
            >
              <QrCodeIcon className="size-5 shrink-0" />
              <span>{t("scanButton")}</span>
            </button>
            <button
              type="button"
              className="touch-manipulation flex h-13 w-full items-center justify-center rounded-2xl border border-border/80 bg-surface-2/40 px-6 py-3.5 text-sm md:text-base font-medium text-foreground transition-all hover:bg-surface-2/80 hover:border-accent/40 active:scale-[0.99]"
              onClick={() => setStage("scratch")}
            >
              {t("manualEntryLink")}
            </button>
          </HexCard>
        </Card>
      )}

      {stage === "scanning" && (
        <Card className="p-6 md:p-7">
          <HexCard className="flex flex-col gap-4 p-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-black/5 min-h-[220px] flex items-center justify-center">
              <Scanner
                onScan={handleScan}
                onError={(err: any) => {
                  setCameraError(
                    err?.message || "Camera access failed. Web cameras require a secure HTTPS connection or permissions."
                  );
                }}
              />
            </div>
            {cameraError && (
              <div className="rounded-xl border border-verify-yellow/40 bg-verify-yellow/10 p-3 text-xs text-verify-yellow">
                <p className="font-semibold">Camera Access Notice</p>
                <p className="mt-1">{cameraError}</p>
                <p className="mt-1 text-muted-foreground">
                  Note: Mobile browsers require HTTPS to stream live video. You can also scan the QR code using your phone's built-in Camera app or enter the code manually below.
                </p>
              </div>
            )}
            <button
              type="button"
              className="text-sm text-muted-foreground underline underline-offset-4 touch-manipulation"
              onClick={() => setStage("start")}
            >
              {t("cancel")}
            </button>
          </HexCard>
        </Card>
      )}

      {stage === "scratch" && (
        <Card className="p-6 md:p-7">
          <HexCard className="p-8">
            <Form {...scratchForm}>
              <form
                onSubmit={scratchForm.handleSubmit((values) => verifyMutation.mutate(values))}
                className="flex flex-col gap-4"
              >
                <h1 className="font-display text-2xl font-medium">{t("scratchTitle")}</h1>
                {tokenQuery.data?.bottleCode && (
                  <p className="text-sm text-muted-foreground">{tokenQuery.data.bottleCode}</p>
                )}
                {tokenQuery.isError && <p className="text-sm text-verify-red">{t("invalidToken")}</p>}

                {!qrToken && (
                  <FormField control={scratchForm.control} name="qrToken" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tokenLabel")}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={scratchForm.control} name="scratchCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("scratchLabel")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <button
                  type="submit"
                  disabled={verifyMutation.isPending}
                  className="touch-manipulation flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-accent px-6 py-3.5 text-base font-medium text-white shadow-sm transition-all hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]"
                >
                  <QrCodeIcon className="size-5 shrink-0" />
                  <span>{verifyMutation.isPending ? t("verifying") : t("verifyButton")}</span>
                </button>
              </form>
            </Form>
          </HexCard>
        </Card>
      )}

      {stage === "result" && result && (
        <Card className="p-6 md:p-7">
          <HexCard className="flex flex-col gap-4 p-8">
            <GlassPanel>
              <p className="text-xs text-muted-foreground">{result.bottleCode}</p>
              <p className={`mt-2 font-display text-2xl ${OUTCOME_COLOR[result.outcome]}`}>
                {t(`outcome.${result.outcome}`)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
            </GlassPanel>

            {result.lifecycle && result.lifecycle.length > 0 && (
              <div className="rounded-2xl border border-accent/30 bg-surface-2 p-4">
                <p className="text-sm font-medium">{t("journeyHeading")}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {result.lifecycle.map((event, i) => (
                    <li key={i} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{event.eventType}</span>
                      <span>{new Date(event.timestamp).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="text-sm text-muted-foreground underline underline-offset-4" onClick={reset}>
              {t("scanAnother")}
            </button>
          </HexCard>
        </Card>
      )}
    </div>
  );
}