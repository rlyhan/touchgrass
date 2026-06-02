import { view } from "./storybook.requires"

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: async (key: string) => {
      try {
        return (globalThis as any).localStorage?.getItem(key) ?? null
      } catch {
        return null
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        ;(globalThis as any).localStorage?.setItem(key, value)
      } catch {}
    },
  },
})

export default StorybookUIRoot
