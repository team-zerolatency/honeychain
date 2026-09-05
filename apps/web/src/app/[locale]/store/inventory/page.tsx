"use client";

import { useTranslations } from "next-intl";
import { useInventory } from "@/hooks/use-store-owner-data";

export default function InventoryPage() {
  const t = useTranslations("store.inventory");
  const inventoryQuery = useInventory();

  return (
    <div>
      <h1 className="font-display text-2xl">{t("heading")}</h1>
      {inventoryQuery.isLoading && <div className="mt-4 h-40 animate-pulse rounded-2xl bg-surface-2" />}
      {inventoryQuery.data?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">{t("noInventory")}</p>}

      <ul className="mt-4 space-y-3">
        {inventoryQuery.data?.map((batch: any) => (
          <li key={batch.id} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-medium">{batch.batchCode}</p>
            <p className="text-xs text-muted-foreground">{batch.harvest.beekeeper.name} ({batch.harvest.beekeeper.memberId})</p>
          </li>
        ))}
      </ul>
    </div>
  );
}