import { cn } from "@/lib/utils";

export function HexCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("hex-card border border-accent/30 bg-surface-2 p-6", className)}>
      {children}
    </div>
  );
}