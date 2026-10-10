// Shared jest.mock factories. Use inside a factory via require, since jest.mock
// is hoisted above imports: jest.mock("x", () => require("@/test-utils/mocks").xMock)
import type { PropsWithChildren } from "react"
import { Text, View } from "react-native"

export const safeAreaMock = {
  SafeAreaView: ({ children, ...props }: PropsWithChildren<object>) => (
    <View {...props}>{children}</View>
  ),
}

export const grassLogoMock = {
  GrassLogo: (props: object) => <View testID="grass-logo" {...props} />,
}

export const activityCardMock = {
  ActivityCard: ({ title }: { title: string }) => <Text testID="activity-card">{title}</Text>,
}

const iconCache = new Map<string, (props: object) => React.JSX.Element>()

// Any icon renders as a View with a kebab-case testID, e.g. Lightbulb -> "lightbulb-icon".
export const lucideMock = new Proxy(
  {},
  {
    get: (_target, name) => {
      if (name === "__esModule") return true
      if (typeof name !== "string" || name === "then") return undefined
      let Icon = iconCache.get(name)
      if (!Icon) {
        const testID = `${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}-icon`
        const MockIcon = (props: object) => <View testID={testID} {...props} />
        MockIcon.displayName = name
        Icon = MockIcon
        iconCache.set(name, Icon)
      }
      return Icon
    },
  },
)
