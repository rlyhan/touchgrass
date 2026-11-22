import { act, renderHook } from "@testing-library/react-native"

import { useAsyncData } from "@/lib/use-async-data"

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe("useAsyncData", () => {
  it("ignores an older load that resolves after a reload", async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const fetcher = jest
      .fn<Promise<string>, []>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const { result } = renderHook(() => useAsyncData(fetcher))

    act(() => {
      result.current.reload()
    })
    await act(async () => {
      second.resolve("new")
    })
    await act(async () => {
      first.resolve("old")
    })

    expect(result.current.data).toBe("new")
    expect(result.current.status).toBe("ready")
  })

  it("ignores an older load that fails after a reload", async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const fetcher = jest
      .fn<Promise<string>, []>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const { result } = renderHook(() => useAsyncData(fetcher))

    act(() => {
      result.current.reload()
    })
    await act(async () => {
      second.resolve("new")
    })
    await act(async () => {
      first.reject(new Error("network"))
    })

    expect(result.current.data).toBe("new")
    expect(result.current.status).toBe("ready")
  })
})
