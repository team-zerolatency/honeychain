import * as React from "react";

export function QrCodeIcon({ className = "size-5", ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Top-left finder pattern */}
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="5" y="5" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />

      {/* Top-right finder pattern */}
      <rect x="15" y="3" width="6" height="6" rx="1.5" />
      <rect x="17" y="5" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />

      {/* Bottom-left finder pattern */}
      <rect x="3" y="15" width="6" height="6" rx="1.5" />
      <rect x="5" y="17" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />

      {/* Alignment / data modules */}
      <rect x="15" y="15" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="19" y="15" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="15" y="19" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="19" y="19" width="2" height="2" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M12 7v4a1 1 0 0 1-1 1H7" strokeWidth="1.75" />
      <path d="M12 17v.01" strokeWidth="2.5" />
      <path d="M17 12h.01" strokeWidth="2.5" />
    </svg>
  );
}
