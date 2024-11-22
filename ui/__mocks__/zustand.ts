// Adapted from https://zustand.docs.pmnd.rs/guides/testing#vitest

import { act } from "@testing-library/react"
import { beforeEach, vi } from "vitest"
import type * as ZustandExportedTypes from "zustand"
import mockStoreInitState from "./mockStoreInitState.json"
export * from "zustand"

const { create: actualCreate } =
  await vi.importActual<typeof ZustandExportedTypes>("zustand")

// a variable to hold reset functions for all stores declared in the app
export const storeResetFns = new Set<() => void>()

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create =
  () =>
  <T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
    const store = actualCreate(stateCreator)

    // TODO: See if init state definition can be moved closer to actual test.
    const initialState = mockStoreInitState as T
    storeResetFns.add(() => store.setState(initialState, true))
    return store
  }

beforeEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn()
    })
  })
})
