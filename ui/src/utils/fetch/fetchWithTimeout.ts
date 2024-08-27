export type FetchInput = string | URL | Request

export type FetchWithTimeoutOptions = RequestInit & {
  timeout?: number
}

const fetchWithTimeout = (
  url: FetchInput,
  options?: FetchWithTimeoutOptions
): { response: Promise<Response>; abort: AbortController["abort"] } => {
  const timeout = options?.timeout ?? 5000
  const ctrl = new AbortController()

  const timeoutId = setTimeout(() => {
    console.error(`Request timed out after ${timeout} ms:`, url)
    ctrl.abort("Request timed out")
  }, timeout)

  const response = fetch(url, { ...options, signal: ctrl.signal }).finally(() =>
    clearTimeout(timeoutId)
  )
  return { response, abort: (reason?: string) => ctrl.abort(reason) }
}

export default fetchWithTimeout
