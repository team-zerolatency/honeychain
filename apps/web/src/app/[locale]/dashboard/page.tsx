"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/navigation";
import { ApiaryCreateSchema, HiveCreateSchema } from "@repo/types";
import { HexCard } from "@repo/ui/hex-card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui/form";
import { useApiaries, useHives, useHarvests, useCreateApiary, useCreateHive } from "@/hooks/use-beekeeper-data";

function StatSkeleton() {
  return <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />;
}

function ApiaryHives({ apiaryId }: { apiaryId: string }) {
  const t = useTranslations("dashboard.overview");
  const hivesQuery = useHives(apiaryId);
  const createHive = useCreateHive();
  const form = useForm({ resolver: zodResolver(HiveCreateSchema), defaultValues: { apiaryId, hiveCode: "" } });

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">{t("hivesIn")}</p>
      <ul className="mt-2 space-y-1">
        {hivesQuery.data?.map((hive: any) => (
          <li key={hive.id}>
            <Link href={`/dashboard/hives/${hive.id}`} className="text-sm text-accent underline underline-offset-4">
              {hive.hiveCode}
            </Link>
          </li>
        ))}
      </ul>
      <form
        onSubmit={form.handleSubmit((v) => createHive.mutate(v, { onSuccess: () => form.reset({ apiaryId, hiveCode: "" }) }))}
        className="mt-3 flex gap-2"
      >
        <Form {...form}>
          <FormField control={form.control} name="hiveCode" render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl><Input placeholder={t("hiveCode")} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </Form>
        <Button type="submit" size="sm" disabled={createHive.isPending}>{t("addHive")}</Button>
      </form>
    </div>
  );
}

export default function DashboardOverview() {
  const t = useTranslations("dashboard.overview");
  const apiariesQuery = useApiaries();
  const harvestsQuery = useHarvests();
  const createApiary = useCreateApiary();
  const [showApiaryForm, setShowApiaryForm] = useState(false);

  const form = useForm({ resolver: zodResolver(ApiaryCreateSchema), defaultValues: { name: "", location: "" } });

  const totalHarvests = harvestsQuery.data?.length ?? 0;
  const pendingBatches = harvestsQuery.data?.filter((h: any) => h.batch && h.batch.status !== "AVAILABLE_FOR_SALE").length ?? 0;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {apiariesQuery.isLoading || harvestsQuery.isLoading ? (
          <><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
        ) : (
          <>
            <HexCard><p className="text-2xl font-display">{apiariesQuery.data?.length ?? 0}</p><p className="text-sm text-muted-foreground">{t("totalHives")}</p></HexCard>
            <HexCard><p className="text-2xl font-display">{totalHarvests}</p><p className="text-sm text-muted-foreground">{t("totalHarvests")}</p></HexCard>
            <HexCard><p className="text-2xl font-display">{pendingBatches}</p><p className="text-sm text-muted-foreground">{t("pendingBatches")}</p></HexCard>
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl">{t("apiaries")}</h2>
        {apiariesQuery.isLoading && <div className="mt-3 h-32 animate-pulse rounded-2xl bg-surface-2" />}
        {apiariesQuery.data?.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{t("noApiaries")}</p>}

        <div className="mt-4 space-y-4">
          {apiariesQuery.data?.map((apiary: any) => (
            <div key={apiary.id} className="rounded-2xl border border-border bg-surface p-4">
              <p className="font-medium">{apiary.name}</p>
              <p className="text-sm text-muted-foreground">{apiary.location}</p>
              <ApiaryHives apiaryId={apiary.id} />
            </div>
          ))}
        </div>

        {!showApiaryForm ? (
          <Button variant="outline" className="mt-4" onClick={() => setShowApiaryForm(true)}>{t("addApiary")}</Button>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => createApiary.mutate(v, { onSuccess: () => { form.reset(); setShowApiaryForm(false); } }))}
              className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-end"
            >
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="flex-1"><FormLabel>{t("apiaryName")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem className="flex-1"><FormLabel>{t("apiaryLocation")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={createApiary.isPending}>{t("addApiary")}</Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}