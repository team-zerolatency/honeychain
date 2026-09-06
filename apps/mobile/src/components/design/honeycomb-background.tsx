import Svg, { Defs, Pattern, Path, Rect } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { Dimensions } from "react-native";

export function HoneycombBackground() {
  const { colorScheme } = useColorScheme();
  const { width, height } = Dimensions.get("window");
  const stroke = colorScheme === "dark" ? "#382A18" : "#E7D9BB";

  return (
    <Svg
      style={{ position: "absolute", top: 0, left: 0, width, height }}
      pointerEvents="none"
    >
      <Defs>
        <Pattern id="honeycomb" width={56} height={97} patternUnits="userSpaceOnUse">
          <Path
            d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L56 80 L56 97 M28 64 L0 80 L0 97"
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            opacity={0.35}
          />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#honeycomb)" />
    </Svg>
  );
}