import { renderHook } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { useNodeCount } from "./store"

vi.mock("zustand")

test("node count should be 1", () => {
  const { result } = renderHook(() => useNodeCount())
  expect(result.current).toBe(0)
})
