import { Circle, Path, Svg } from "react-native-svg"

type Props = {
  color: string
  size?: number
  strokeWidth?: number
}

export function PatternIcon({ color, size = 24, strokeWidth = 1.7 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    >
      <Path d="M12 2 L20.66 7 L20.66 17 L12 22 L3.34 17 L3.34 7 Z" />
      <Path d="M12 6.5 L17.5 12 L12 17.5 L6.5 12 Z" />
      <Circle cx={12} cy={12} r={1.75} />
    </Svg>
  )
}
