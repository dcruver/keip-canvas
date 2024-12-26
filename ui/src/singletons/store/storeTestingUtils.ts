import { renderHook } from "@testing-library/react"

// Zustand mock import (see '/home/aasaad/projects/keip-canvas/ui/__mocks__/zustand.ts')
// @ts-expect-error the reset function does not exist as a zustand export.
// It is added to the mock as a convenience for setup and cleanup of the store in the tests
import { resetStore } from "zustand"

// WARNING: In test files, import the reset method last, to ensure it's properly initialized.
export const resetMockStore = resetStore as (s: object) => void

export function renderAndUnwrapHook<T>(hookFn: () => T): T {
  const { result } = renderHook(hookFn)
  return result.current
}
