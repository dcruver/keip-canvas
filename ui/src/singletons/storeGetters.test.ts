import { renderHook } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { useGetNodes, useNodeCount } from "./store"

vi.mock("zustand")

test("initial node count should be 3", () => {
  const { result } = renderHook(() => useNodeCount())
  expect(result.current).toBe(3)
})

test("get nodes and check labels are set", () => {
  const { result } = renderHook(() => useGetNodes())
  const labels = result.current.map((n) => n.data.label)
  expect(labels).toEqual(["n1", "n2", "n3"])
})
