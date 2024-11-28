import { act, renderHook } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { useEipFlow } from "../store"
import { resetMockStore } from "./storeTestingUtils"
import initState from "./testdata/storeState1.json"

vi.mock("zustand")

test("diagram to EipFlow success", () => {
  act(() => {
    resetMockStore(initState)
  })
  
  const { result } = renderHook(() => useEipFlow())
  expect(result.current).toMatchSnapshot()
})
