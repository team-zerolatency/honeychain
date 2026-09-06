import { View, type LayoutChangeEvent } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { useState } from "react";
import { useColorScheme } from "nativewind";

const CUT = 16; // matches the web version's --hex-card clip-path corner size

function hexPoints(width: number, height: number) {
  return [
    `${CUT},0`, `${width},0`, `${width},${height - CUT}`,
    `${width - CUT},${height}`, `0,${height}`, `0,${CUT}`,
  ].join(" ");
}

export function HexCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { colorScheme } = useColorScheme();
  const fill = colorScheme === "dark" ? "#271C11" : "#FDF3DC";
  const stroke = colorScheme === "dark" ? "#E8A31780" : "#C2790C4D";

  return (
    <View className={className} onLayout={(e: LayoutChangeEvent) => setSize(e.nativeEvent.layout)}>
      {size.width > 0 && (
        <Svg style={{ position: "absolute", top: 0, left: 0 }} width={size.width} height={size.height}>
          <Polygon points={hexPoints(size.width, size.height)} fill={fill} stroke={stroke} strokeWidth={1} />
        </Svg>
      )}
      <View className="p-4">{children}</View>
    </View>
  );
}