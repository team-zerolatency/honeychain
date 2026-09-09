import { useColorScheme } from "nativewind";

/**
 * NativeWind v4's `dark:` variant classes were unreliable here (confirmed: colorScheme
 * state itself updates correctly — proven by the honeycomb background, which reads
 * colorScheme directly in JS — but bare `dark:` prefixed classNames on plain Views/Text
 * did not re-resolve on toggle, a known issue in monorepo setups). Standing rule for
 * this app: never write a bare `dark:` prefix class — always resolve through `t()` below.
 */
export function useAppColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  function t(lightClasses: string, darkClasses: string): string {
    return isDark ? darkClasses : lightClasses;
  }

  return { isDark, colorScheme, setColorScheme, toggleColorScheme, t };
}