import { useCallback, useEffect, useRef, useState } from "react"

type Status = "loading" | "ready" | "error"

export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>()
  const [status, setStatus] = useState<Status>("loading")
  const latestLoad = useRef(0)

  const load = useCallback(async () => {
    const thisLoad = ++latestLoad.current
    setStatus("loading")
    try {
      const result = await fetcher()
      if (thisLoad !== latestLoad.current) return
      setData(result)
      setStatus("ready")
    } catch {
      if (thisLoad !== latestLoad.current) return
      setStatus("error")
    }
  }, [fetcher])

  useEffect(() => {
    load()
  }, [load])

  return { data, status, reload: load }
}
