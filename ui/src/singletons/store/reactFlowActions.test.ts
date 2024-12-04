import { act } from "@testing-library/react"
import { Connection, NodeRemoveChange } from "reactflow"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { DYNAMIC_EDGE_TYPE, DynamicEdgeData } from "../../api/flow"
import { ROOT_PARENT } from "../../api/id"
import { useGetEipAttribute } from "./getterHooks"
import { onConnect, onNodesChange } from "./reactFlowActions"
import { renderAndUnwrapHook, resetMockStore } from "./storeTestingUtils"
import { getEdgesView, getNodesView } from "./storeViews"
import disconnectedFlow from "./testdata/store-initializers/disconnectedFlow.json"
import standardFlow from "./testdata/store-initializers/standardFlow.json"

vi.mock("zustand")

const FILTER_ID = "SV43RVeijQ"

beforeEach(() => {
  act(() => {
    resetMockStore(standardFlow)
  })
})

describe("onNodesChange", () => {
  test("config is removed when a node is deleted", () => {
    const attrName = "expression"

    // assert config exists before removing node
    const initialValue = renderAndUnwrapHook(() =>
      useGetEipAttribute(FILTER_ID, ROOT_PARENT, attrName)
    )
    expect(initialValue).toBeTruthy()

    const change: NodeRemoveChange = { id: FILTER_ID, type: "remove" }
    act(() => onNodesChange([change]))

    const finalValue = renderAndUnwrapHook(() =>
      useGetEipAttribute(FILTER_ID, ROOT_PARENT, attrName)
    )
    expect(finalValue).toBeUndefined()

    const checkDeleted = getNodesView().find((n) => n.id === FILTER_ID)
    expect(checkDeleted).toBeUndefined()
  })
})

describe("onConnect", () => {
  beforeEach(() => {
    act(() => {
      resetMockStore(disconnectedFlow)
    })
  })

  test("connecting a default (non-router) edge", () => {
    const connection: Connection = {
      source: "yiSAwF9JPY",
      target: "1QUBRFgUcd",
      sourceHandle: null,
      targetHandle: null,
    }

    act(() => onConnect(connection))

    const edges = getEdgesView()
    expect(edges).toHaveLength(1)

    const edge = edges[0]
    expect(edge).toMatchObject(connection)
    expect(edge.type).toBeUndefined()
    expect(edge.animated).toBeUndefined()
    expect(edge.data).toBeUndefined()
  })

  test("connecting a dynamic router edge", () => {
    const connection: Connection = {
      source: "1QUBRFgUcd",
      target: "XMypRiNV-I",
      sourceHandle: null,
      targetHandle: null,
    }

    act(() => onConnect(connection))

    const edges = getEdgesView()
    expect(edges).toHaveLength(1)

    const edge = edges[0]
    expect(edge.source).toEqual(connection.source)
    expect(edge.target).toEqual(connection.target)
    expect(edge.type).toEqual(DYNAMIC_EDGE_TYPE)
    expect(edge.animated).toBe(true)

    const data = edge.data as DynamicEdgeData
    expect(data.mapping.mapperName).toEqual("mapping")
    expect(data.mapping.matcher.name).toEqual("value")
  })
})
