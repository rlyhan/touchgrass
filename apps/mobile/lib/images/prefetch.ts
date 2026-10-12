import { Image } from "expo-image"

const LEAD_IMAGE_COUNT = 3
const PREFETCH_TIMEOUT_MS = 1500

// Resolves once the first few images are in the memory cache, or after the
// timeout so one slow image can't hold up the caller.
export async function prefetchLeadImages(items: { imageUrl: string }[]): Promise<void> {
  const urls = items.slice(0, LEAD_IMAGE_COUNT).map((item) => item.imageUrl)
  if (urls.length === 0) return
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, PREFETCH_TIMEOUT_MS)
    Image.prefetch(urls, "memory-disk")
      .catch(() => false)
      .finally(() => {
        clearTimeout(timer)
        resolve()
      })
  })
}
