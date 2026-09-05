"use client";

import { useTranslations } from "next-intl";
import { useAuditTrail } from "@/hooks/use-admin-data";

function truncateHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export default function AdminAuditPage() {
  const t = useTranslations("admin.audit");
  const auditQuery = useAuditTrail();

  return (
    <div>
      <h1 className="font-display text-2xl">{t("heading")}</h1>

      {auditQuery.isLoading && <div className="mt-4 h-64 animate-pulse rounded-2xl bg-surface-2" />}
      {auditQuery.data?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">{t("noEvents")}</p>}

      {auditQuery.data && auditQuery.data.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">{t("event")}</th>
                <th className="px-4 py-3 font-normal">{t("entity")}</th>
                <th className="px-4 py-3 font-normal">{t("actor")}</th>
                <th className="px-4 py-3 font-normal">{t("txHash")}</th>
                <th className="px-4 py-3 font-normal">{t("time")}</th>
              </tr>
            </thead>
            <tbody>
              {auditQuery.data.map((event: any) => (
                <tr key={event.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{event.eventType}</td>
                  <td className="px-4 py-3 font-mono text-xs">{event.batch?.batchCode ?? event.bottle?.bottleCode}</td>
                  <td className="px-4 py-3">{event.actor.name} <span className="text-muted-foreground">({event.actor.memberId ?? event.actor.email})</span></td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {event.txHash ? truncateHash(event.txHash) : <span className="text-muted-foreground">{t("noTx")}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}