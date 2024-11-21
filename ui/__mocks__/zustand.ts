// Adapted from https://zustand.docs.pmnd.rs/guides/testing#vitest

import { act } from "@testing-library/react"
import { afterEach, vi } from "vitest"
import type * as ZustandExportedTypes from "zustand"
export * from "zustand"

const { create: actualCreate } =
  await vi.importActual<typeof ZustandExportedTypes>("zustand")

// a variable to hold reset functions for all stores declared in the app
export const storeResetFns = new Set<() => void>()

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create =
  () =>
  <T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
    console.log("zustand create mock")
    const store = actualCreate(stateCreator)
    const initialState = store.getInitialState()
    storeResetFns.add(() => store.setState(initialState, true))
    return store
  }

// reset all stores after each test run
afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn()
    })
  })
})
