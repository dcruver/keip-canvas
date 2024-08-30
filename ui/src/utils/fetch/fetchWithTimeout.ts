export type FetchInput = string | URL | Request

export type FetchWithTimeoutOptions = RequestInit & {
  timeout?: number
  abortCtrl?: AbortController
}

const fetchWithTimeout = (
  url: FetchInput,
  options?: FetchWithTimeoutOptions
): Promise<Response> => {
  const timeout = options?.timeout ?? 5000
  const ctrl = options?.abortCtrl ?? new AbortController()

  const timeoutId = setTimeout(() => {
    console.error(`Request timed out after ${timeout} ms:`, url)
    ctrl.abort(new Error("Request timed out"))
  }, timeout)

  return fetch(url, { ...options, signal: ctrl.signal }).finally(() =>
    clearTimeout(timeoutId)
  )
}

export default fetchWithTimeout
