"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateBeekeeperSchema, type IssuedCredentials } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/form";
import { GlassPanel } from "@repo/ui/glass-panel";
import { useAllBeekeepers, useCreateBeekeeperAccount } from "@/hooks/use-admin-data";

export default function AdminBeekeepersPage() {
  const t = useTranslations("admin.beekeepers");
  const beekeepersQuery = useAllBeekeepers();
  const createBeekeeper = useCreateBeekeeperAccount();
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);

  const form = useForm({ resolver: zodResolver(CreateBeekeeperSchema), defaultValues: { name: "" } });

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
            onSubmit={form.handleSubmit((v) => createBeekeeper.mutate(v, { onSuccess: (data) => { setIssued(data); form.reset(); } }))}
            className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-end"
          >
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="flex-1"><FormLabel>{t("name")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={createBeekeeper.isPending}>
              {createBeekeeper.isPending ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      )}

      <h2 className="mt-8 font-display text-xl">{t("list")}</h2>
      {beekeepersQuery.isLoading && <div className="mt-3 h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {beekeepersQuery.data?.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{t("noBeekeepers")}</p>}
      <ul className="mt-4 space-y-2">
        {beekeepersQuery.data?.map((b: any) => (
          <li key={b.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <div>
              <p className="text-sm font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.memberId}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {b._count.apiaries} {t("apiaryCount")} · {b._count.harvests} {t("harvestCount")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}