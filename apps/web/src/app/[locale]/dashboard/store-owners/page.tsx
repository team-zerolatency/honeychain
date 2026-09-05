"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateStoreOwnerSchema, type IssuedCredentials } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/form";
import { GlassPanel } from "@repo/ui/glass-panel";
import { useStoreOwners, useCreateStoreOwner } from "@/hooks/use-beekeeper-data";

export default function StoreOwnersPage() {
  const t = useTranslations("dashboard.storeOwners");
  const ownersQuery = useStoreOwners();
  const createOwner = useCreateStoreOwner();
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);

  const form = useForm({ resolver: zodResolver(CreateStoreOwnerSchema), defaultValues: { name: "", location: "" } });

  return (
    <div>
      <h1 className="font-display text-2xl">{t("issue")}</h1>

      {issued ? (
        <GlassPanel className="mt-4">
          <p className="text-sm font-medium text-verify-yellow">{t("issuedTitle")}</p>
          <p className="mt-3 text-sm"><span className="text-muted-foreground">{t("memberId")}: </span>{issued.memberId}</p>
          <p className="mt-1 text-sm"><span className="text-muted-foreground">{t("temporaryPassword")}: </span>{issued.temporaryPassword}</p>
          <Button className="mt-4" size="sm" onClick={() => setIssued(null)}>{t("close")}</Button>
        </GlassPanel>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              createOwner.mutate(v, { onSuccess: (data) => { setIssued(data); form.reset(); } })
            )}
            className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-end"
          >
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="flex-1"><FormLabel>{t("name")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem className="flex-1"><FormLabel>{t("location")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={createOwner.isPending}>
              {createOwner.isPending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      )}

      <h2 className="mt-8 font-display text-xl">{t("list")}</h2>
      {ownersQuery.isLoading && <div className="mt-3 h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {ownersQuery.data?.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{t("noOwners")}</p>}
      <ul className="mt-4 space-y-2">
        {ownersQuery.data?.map((o: any) => (
          <li key={o.id} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-medium">{o.name}</p>
            <p className="text-xs text-muted-foreground">{o.memberId} — {o.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}