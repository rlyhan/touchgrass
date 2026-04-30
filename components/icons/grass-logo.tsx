import Svg, { Path } from "react-native-svg"

type Props = {
  size?: number
  color?: string
  className?: string
}

export function GrassLogo({ size = 48, color = "#10b981", className }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <Path
        d="M24 44C22 38 14 28 10 18C8 12 12 6 12 6"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24 44C23 36 20 26 18 16C16 10 20 4 20 4"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24 44C25 34 27 24 28 14C29 8 27 2 27 2"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24 44C28 36 34 26 38 18C40 12 36 6 36 6"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
