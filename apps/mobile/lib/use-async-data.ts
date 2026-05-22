import { useCallback, useEffect, useState } from "react"

type Status = "loading" | "ready" | "error"

export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>()
  const [status, setStatus] = useState<Status>("loading")

  const load = useCallback(async () => {
    setStatus("loading")
    try {
      const result = await fetcher()
      setData(result)
      setStatus("ready")
    } catch {
      setStatus("error")
    }
  }, [fetcher])

  useEffect(() => {
    load()
  }, [load])

  return { data, status, reload: load }
}
