import { Suspense } from "react";
import { VerificationFlow } from "@/components/verify/verification-flow";

function VerifySkeleton() {
  return (
    <div className="mx-auto max-w-md animate-pulse px-6 py-16">
      <div className="h-8 w-2/3 rounded bg-surface-2" />
      <div className="mt-4 h-4 w-full rounded bg-surface-2" />
      <div className="mt-6 h-10 w-full rounded-full bg-surface-2" />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifySkeleton />}>
      <VerificationFlow />
    </Suspense>
  );
}