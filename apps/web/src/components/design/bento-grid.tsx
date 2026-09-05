import { cn } from "@/lib/utils";

export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function BentoCell({
  className,
  span = 1,
  children,
}: {
  className?: string;
  span?: 1 | 2 | 4;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6",
        span === 2 && "md:col-span-2",
        span === 4 && "md:col-span-4",
        className
      )}
    >
      {children}
    </div>
  );
}