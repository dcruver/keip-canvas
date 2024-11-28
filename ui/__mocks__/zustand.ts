// Adapted from https://zustand.docs.pmnd.rs/guides/testing#vitest

import { vi } from "vitest"
import type * as ZustandExportedTypes from "zustand"
export * from "zustand"

const { create: actualCreate } =
  await vi.importActual<typeof ZustandExportedTypes>("zustand")

// a variable to hold a reset function for the mock store
export let resetStore: (state: object) => void

export const create =
  () =>
  <T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
    const store = actualCreate(stateCreator)
    resetStore = (state) => store.setState(state, true)
    return store
  }
