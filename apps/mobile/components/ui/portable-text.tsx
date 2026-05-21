import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types"
import { Text, View } from "react-native"

type Props = {
  blocks: PortableTextBlock[]
  className?: string
  paragraphClassName?: string
}

function isTextBlock(block: PortableTextBlock): boolean {
  return block._type === "block"
}

function isSpan(child: unknown): child is PortableTextSpan {
  return (
    typeof child === "object" &&
    child !== null &&
    (child as { _type?: string })._type === "span"
  )
}

export function PortableText({
  blocks,
  className,
  paragraphClassName = "mb-4 leading-relaxed text-gray-500",
}: Props) {
  return (
    <View className={className}>
      {blocks.filter(isTextBlock).map((block, blockIdx) => {
        const children = (block.children ?? []).filter(isSpan)
        return (
          <Text key={block._key ?? blockIdx} className={paragraphClassName}>
            {children.map((span, spanIdx) => {
              const marks = span.marks ?? []
              const style = {
                fontWeight: marks.includes("strong") ? ("700" as const) : undefined,
                fontStyle: marks.includes("em") ? ("italic" as const) : undefined,
              }
              return (
                <Text key={span._key ?? spanIdx} style={style}>
                  {span.text}
                </Text>
              )
            })}
          </Text>
        )
      })}
    </View>
  )
}
