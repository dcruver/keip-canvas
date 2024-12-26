import { act } from "@testing-library/react"
import { beforeEach, expect, test, vi } from "vitest"
import { childrenBreadthTraversal, childrenDepthTraversal } from "./storeViews"
import nestedChildFlow from "./testdata/store-initializers/nestedChildFlow.json"

import { resetMockStore } from "./storeTestingUtils"

vi.mock("zustand")

const ROOT_ID = "FL5Tssm8tV"

beforeEach(() => {
  act(() => {
    resetMockStore(nestedChildFlow)
  })
})

test("traverse children depth-first search", () => {
  const nodes = [...childrenDepthTraversal(ROOT_ID)]
  expect(nodes).toMatchSnapshot()
})

test("traverse children breadth-first search", () => {
  const nodes = [...childrenBreadthTraversal(ROOT_ID)]
  expect(nodes).toMatchSnapshot()
})
