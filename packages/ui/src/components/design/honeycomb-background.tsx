export function HoneycombBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full text-foreground/25 opacity-75 dark:text-border dark:opacity-30 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id="honeycomb" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <path
            d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L56 80 L56 97 M28 64 L0 80 L0 97"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />

        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#honeycomb)" />
    </svg>
  );
}