import { act } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { RouterKey } from "../../api/flow"
import { ROOT_PARENT } from "../../api/id"
import {
  useGetChildren,
  useGetContentRouterKey,
  useGetEipAttribute,
  useGetNodeDescription,
  useGetRouterDefaultEdgeMapping,
  useSerializedStore,
} from "./getterHooks"
import { renderAndUnwrapHook, resetMockStore } from "./storeTestingUtils"
import childBasedRouterFlow from "./testdata/store-initializers/childBasedRouterFlow.json"
import standardFlow from "./testdata/store-initializers/standardFlow.json"

vi.mock("zustand")

const N1_ID = "9KWCqlIyy7"
const N2_ID = "LoiC2CFbLP"
const N3_ID = "pQv30nNaZI"

// TODO: Do we really need to use 'act'?
beforeEach(() => {
  act(() => {
    resetMockStore(standardFlow)
  })
})

test("serialized store includes nodes, edges, and eipNodeConfigs only", () => {
  const storeJson = renderAndUnwrapHook(useSerializedStore)
  expect(storeJson).toMatchSnapshot()
})

describe("get node description", () => {
  test.each([
    {
      msg: "node id is present -> value",
      id: N1_ID,
      result: "message incoming",
    },
    {
      msg: "node id is present but no description -> undefined",
      id: N3_ID,
      result: undefined,
    },
    {
      msg: "unknown node id -> undefined",
      id: "fakeid",
      result: undefined,
    },
  ])("$msg", ({ id, result }) => {
    const description = renderAndUnwrapHook(() => useGetNodeDescription(id))
    expect(description).toEqual(result)
  })
})

describe("get EIP attribute", () => {
  test.each([
    {
      msg: "root node id and attribute are present -> value",
      id: N2_ID,
      parentId: ROOT_PARENT,
      attrName: "phase",
      result: "init",
    },
    {
      msg: "parent id, child id, and child attribute name are present -> value",
      id: "poller",
      parentId: N1_ID,
      attrName: "fixed-rate",
      result: "2000",
    },
    {
      msg: "root node id is present but attribute name is unknown -> undefined",
      id: N2_ID,
      parentId: ROOT_PARENT,
      attrName: "fakeattr",
      result: undefined,
    },
    {
      msg: "unknown root node id -> undefined",
      id: "fakeid",
      parentId: ROOT_PARENT,
      attrName: "ref",
      result: undefined,
    },
    {
      msg: "unknown parent id -> undefined",
      id: "poller",
      parentId: "fakeid",
      attrName: "fixed-rate",
      result: undefined,
    },
    {
      msg: "unknown child id -> undefined",
      id: "other",
      parentId: N1_ID,
      attrName: "fixed-rate",
      result: undefined,
    },
  ])("$msg", ({ id, parentId, attrName, result }) => {
    const value = renderAndUnwrapHook(() =>
      useGetEipAttribute(id, parentId, attrName)
    )
    expect(value).toEqual(result)
  })
})

describe("get list of children", () => {
  test("node has children -> value", () => {
    const children = renderAndUnwrapHook(() => useGetChildren(N1_ID))
    expect(children).toEqual(["poller"])
  })

  test("node does not have children -> empty array", () => {
    const children = renderAndUnwrapHook(() => useGetChildren(N3_ID))
    expect(children).toEqual([])
  })

  test("unknown node id -> empty array", () => {
    const children = renderAndUnwrapHook(() => useGetChildren("fakeid"))
    expect(children).toEqual([])
  })
})

describe("get content router key", () => {
  test("node id is a router -> value", () => {
    const key = renderAndUnwrapHook(() => useGetContentRouterKey(N2_ID))
    const expected: RouterKey = {
      name: "expression",
      attributes: { expression: "headers.protocol" },
    }
    expect(key).toEqual(expected)
  })

  test("unknown node id -> value", () => {
    const key = renderAndUnwrapHook(() => useGetContentRouterKey("fakeid"))
    expect(key).toBeUndefined()
  })
})

describe("get content router default edge mapping", () => {
  test("node is a router and has a default edge -> value", () => {
    const edge = renderAndUnwrapHook(() =>
      useGetRouterDefaultEdgeMapping(N2_ID)
    )
    expect(edge?.id).toEqual("reactflow__edge-LoiC2CFbLPoutput-H4-ED4F0XTinput")
  })

  test("node is not a router -> undefined", () => {
    const edge = renderAndUnwrapHook(() =>
      useGetRouterDefaultEdgeMapping(N1_ID)
    )
    expect(edge).toBeUndefined()
  })

  test("node is a router with no default mapping -> undefined", () => {
    act(() => {
      resetMockStore(childBasedRouterFlow)
    })
    const edge = renderAndUnwrapHook(() =>
      useGetRouterDefaultEdgeMapping("cGUxaVOQ7L")
    )
    expect(edge).toBeUndefined()
  })
})
