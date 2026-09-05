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

  function reset() {
    setStage("start");
    setQrToken(null);
    setResult(null);
    scratchForm.reset();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      {stage === "start" && (
        <Card className="p-6 md:p-7">
          <HexCard className="flex flex-col gap-4 p-8">
            <h1 className="font-display text-2xl font-medium">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
            <Button onClick={() => setStage("scanning")}>{t("scanButton")}</Button>
            <button
              className="text-sm text-muted-foreground underline underline-offset-4"
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
            <div className="overflow-hidden rounded-2xl border border-border">
              <Scanner onScan={handleScan} onError={() => {}} />
            </div>
            <button
              className="text-sm text-muted-foreground underline underline-offset-4"
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
                <Button type="submit" disabled={verifyMutation.isPending}>
                  {verifyMutation.isPending ? t("verifying") : t("verifyButton")}
                </Button>
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