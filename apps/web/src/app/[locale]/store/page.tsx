"use client";

import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/button";
import { useShipments, useRecordStoreEvent } from "@/hooks/use-store-owner-data";

export default function ShipmentsPage() {
  const t = useTranslations("store.shipments");
  const shipmentsQuery = useShipments();
  const recordEvent = useRecordStoreEvent();

  return (
    <div>
      <h1 className="font-display text-2xl">{t("heading")}</h1>
      {shipmentsQuery.isLoading && <div className="mt-4 h-40 animate-pulse rounded-2xl bg-surface-2" />}
      {shipmentsQuery.data?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">{t("noShipments")}</p>}

      <ul className="mt-4 space-y-3">
        {shipmentsQuery.data?.map((batch: any) => (
          <li key={batch.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <div>
              <p className="text-sm font-medium">{batch.batchCode}</p>
              <p className="text-xs text-muted-foreground">
                {t("from")}: {batch.harvest.beekeeper.name} ({batch.harvest.beekeeper.memberId}) · {t("status")}: {batch.status}
              </p>
            </div>
            {batch.status === "DISPATCHED" && (
              <Button
                size="sm"
                disabled={recordEvent.isPending}
                onClick={() => recordEvent.mutate({ batchId: batch.id, eventType: "RECEIVED" })}
              >
                {recordEvent.isPending ? t("confirming") : t("confirmReceipt")}
              </Button>
            )}
            {batch.status === "RECEIVED" && (
              <Button
                size="sm"
                variant="outline"
                disabled={recordEvent.isPending}
                onClick={() => recordEvent.mutate({ batchId: batch.id, eventType: "AVAILABLE_FOR_SALE" })}
              >
                {recordEvent.isPending ? t("marking") : t("markAvailable")}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}