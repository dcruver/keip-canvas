import { act, renderHook } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { useEipFlow } from "../store"
import { resetMockStore } from "./storeTestingUtils"
import childBasedRouterState from "./testdata/childBasedRouterFlow.json"
import standardFlow from "./testdata/standardFlow.json"

vi.mock("zustand")

test("standard diagram to EipFlow success", () => {
  act(() => {
    resetMockStore(standardFlow)
  })

  const { result } = renderHook(() => useEipFlow())
  expect(result.current).toMatchSnapshot()
})

test("diagram includes a router with child based matcher to EipFlow success", () => {
  act(() => {
    resetMockStore(childBasedRouterState)
  })

  const { result } = renderHook(() => useEipFlow())
  expect(result.current).toMatchSnapshot()
})
