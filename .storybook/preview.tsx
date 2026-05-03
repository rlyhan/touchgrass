import { View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import type { Preview } from "@storybook/react-native"

import "../global.css"

const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <View style={{ flex: 1, padding: 16, backgroundColor: "#ffffff" }}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "white",
      values: [
        { name: "white", value: "#ffffff" },
        { name: "gray", value: "#f3f4f6" },
        { name: "dark", value: "#111827" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
