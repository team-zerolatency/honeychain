"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HarvestCreateSchema } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useApiaries, useHives, useHarvests, useCreateHarvest, useCreateBatch, useRecordLifecycleEvent, useCreateBottle } from "@/hooks/use-beekeeper-data";
import { useState } from "react";
import { QrCodeDisplay } from "@/components/qr-code-display";
import { LabelDownloadButton } from "@/components/label-download-button";

function AllHivesSelect({ field }: { field: any }) {
  const apiariesQuery = useApiaries();
  return (
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
      <SelectContent>
        {apiariesQuery.data?.map((apiary: any) => <HiveOptions key={apiary.id} apiaryId={apiary.id} />)}
      </SelectContent>
    </Select>
  );
}


function HiveOptions({ apiaryId }: { apiaryId: string }) {
  const hivesQuery = useHives(apiaryId);
  return <>{hivesQuery.data?.map((h: any) => <SelectItem key={h.id} value={h.id}>{h.hiveCode}</SelectItem>)}</>;
}

function BatchActions({ batch }: { batch: { id: string; status: string } }) {
  const t = useTranslations("dashboard.harvests");
  const tStages = useTranslations("lifecycle.stages");
  const createBottle = useCreateBottle();
  const recordEvent = useRecordLifecycleEvent();
  const [lastBottle, setLastBottle] = useState<{ qrToken: string; bottleCode: string; scratchCode: string } | null>(null);

  const nextAction =
    batch.status === "HARVESTED"
      ? { label: t("markExtracted"), eventType: "EXTRACTED" }
      : batch.status === "EXTRACTED"
      ? { label: t("markPacked"), eventType: "PACKED" }
      : batch.status === "PACKED"
      ? { label: t("dispatchShipment"), eventType: "DISPATCHED" }
      : null;

  return (
    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
      <div className="flex flex-wrap items-center gap-2">
        {nextAction && (
          <Button
            size="sm"
            disabled={recordEvent.isPending}
            onClick={() => recordEvent.mutate({ batchId: batch.id, eventType: nextAction.eventType })}
          >
            {recordEvent.isPending ? t("updating") : nextAction.label}
          </Button>
        )}
        {batch.status === "DISPATCHED" && (
          <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-500">
            {tStages("dispatched")}
          </span>
        )}
        {(batch.status === "RECEIVED" || batch.status === "AVAILABLE_FOR_SALE") && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-500">
            {batch.status === "RECEIVED" ? tStages("received") : tStages("availableForSale")}
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={createBottle.isPending}
          onClick={() => createBottle.mutate({ batchId: batch.id }, { onSuccess: (data) => setLastBottle(data) })}
        >
          {createBottle.isPending ? t("creatingBottle") : t("createBottle")}
        </Button>
      </div>
      {lastBottle && (
        <div className="mt-2 flex flex-col items-center sm:items-end gap-2 rounded-2xl border border-border bg-surface p-3 w-full sm:w-auto">
          <QrCodeDisplay qrToken={lastBottle.qrToken} size={100} />
          <p className="text-xs text-muted-foreground">{lastBottle.bottleCode}</p>
          <p className="text-xs text-verify-yellow">{t("scratchOnceWarning")}: {lastBottle.scratchCode}</p>
          <LabelDownloadButton bottle={lastBottle} />
        </div>
      )}
    </div>
  );
}

export default function HarvestsPage() {
  const t = useTranslations("dashboard.harvests");
  const harvestsQuery = useHarvests();
  const createHarvest = useCreateHarvest();
  const createBatch = useCreateBatch();

  const form = useForm({
    resolver: zodResolver(HarvestCreateSchema),
    defaultValues: { hiveId: "", quantity: 0, harvestDate: new Date(), location: "" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl">{t("record")}</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => createHarvest.mutate(v, { onSuccess: () => form.reset() }))}
          className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-4"
        >
          <FormField control={form.control} name="hiveId" render={({ field }) => (
            <FormItem><FormLabel>{t("hive")}</FormLabel><AllHivesSelect field={field} /><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="quantity" render={({ field }) => (
            <FormItem><FormLabel>{t("quantity")}</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem><FormLabel>{t("location")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={createHarvest.isPending}>
              {createHarvest.isPending ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      </Form>

      <h2 className="mt-8 font-display text-xl">{t("list")}</h2>
      {harvestsQuery.isLoading && <div className="mt-3 h-40 animate-pulse rounded-2xl bg-surface-2" />}
      {harvestsQuery.data?.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{t("noHarvests")}</p>}

      <ul className="mt-4 space-y-3">
        {harvestsQuery.data?.map((h: any) => (
          <li key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <div>
              <p className="text-sm font-medium">{h.quantity} kg — {new Date(h.harvestDate).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">{t("batchStatus")}: {h.batch?.status ?? t("noBatch")}</p>
            </div>
            {!h.batch && (
              <Button
                size="sm"
                variant="outline"
                disabled={createBatch.isPending}
                onClick={() => createBatch.mutate({ harvestId: h.id, quantity: h.quantity, processingDate: new Date() })}
              >
                {createBatch.isPending ? t("creatingBatch") : t("createBatch")}
              </Button>
            )}
            {h.batch && <BatchActions batch={h.batch} />}
          </li>
        ))}
      </ul>
    </div>
  );
}