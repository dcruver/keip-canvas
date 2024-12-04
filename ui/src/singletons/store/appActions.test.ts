import { act } from "@testing-library/react"
import isDeepEqual from "fast-deep-equal"
import { Position } from "reactflow"
import { beforeEach, describe, expect, test, vi } from "vitest"
import {
  ChannelMapping,
  DynamicEdgeData,
  EIP_NODE_TYPE,
  Layout,
  RouterKey,
} from "../../api/flow"
import { ChildNodeId, ROOT_PARENT } from "../../api/id"
import {
  useGetChildren,
  useGetContentRouterKey,
  useGetEipAttribute,
  useGetNodeDescription,
  useGetSelectedChildNode,
} from "./getterHooks"
import { renderAndUnwrapHook, resetMockStore } from "./storeTestingUtils"
import selectedNodeFlow from "./testdata/store-initializers/singleSelectedNodeFlow.json"
import standardFlow from "./testdata/store-initializers/standardFlow.json"
import unspecifiedRouterFlow from "./testdata/store-initializers/unspecifiedRouterFlow.json"
import verticalFlow from "./testdata/store-initializers/verticalFlow.json"

import {
  clearDiagramSelections,
  clearFlow,
  createDroppedNode,
  deleteEipAttribute,
  importFlowFromJson,
  toggleLayoutDensity,
  updateContentRouterKey,
  updateDynamicEdgeMapping,
  updateEipAttribute,
  updateEnabledChildren,
  updateLayoutOrientation,
  updateNodeDescription,
  updateNodeLabel,
  updateSelectedChildNode,
} from "./appActions"
import { getEdgesView, getLayoutView, getNodesView } from "./storeViews"
import validExportedFlow from "./testdata/exported-diagrams/validFlow.json?raw"

vi.mock("zustand")

const N1_ID = "9KWCqlIyy7"
const N2_ID = "LoiC2CFbLP"

beforeEach(() => {
  act(() => {
    resetMockStore(standardFlow)
  })
})

const getNode = (id: string) => {
  const nodes = getNodesView()
  const target = nodes.find((n) => n.id === id)
  if (!target) {
    throw new Error(`Could not find node with id: ${id}`)
  }
  return target
}

const getNodePositions = () =>
  getNodesView().map((node) => ({
    [node.id]: {
      position: node.position,
      absPosition: node.positionAbsolute,
    },
  }))

describe("create dropped node", () => {
  test.each([
    {
      msg: "create with horizontal layout",
      storeState: standardFlow,
      orientation: "horizontal",
      handlePosition: {
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      },
    },
    {
      msg: "create with vertical layout",
      storeState: verticalFlow,
      orientation: "vertical",
      handlePosition: {
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      },
    },
  ])("$msg", ({ storeState, orientation, handlePosition }) => {
    // Initialize store
    act(() => {
      resetMockStore(storeState)
    })

    // Assert expected layout
    const layout = getLayoutView()
    expect(layout.orientation).toEqual(orientation)

    const eipId = { namespace: "test", name: "transformer" }
    const position = { x: 5, y: 10 }
    act(() => createDroppedNode(eipId, position))

    const nodes = getNodesView()
    const node = nodes.find((n) => isDeepEqual(n.data.eipId, eipId))!

    expect(node.position).toEqual(position)
    expect(node.id).toBeTruthy()
    expect(node.type).toEqual(EIP_NODE_TYPE)
    expect(node.targetPosition).toEqual(handlePosition.targetPosition)
    expect(node.sourcePosition).toEqual(handlePosition.sourcePosition)
  })
})

describe("update node label", () => {
  test("update node with unique label success", () => {
    const label = "test-label-123"

    act(() => void updateNodeLabel(N1_ID, label))

    const target = getNode(N1_ID)
    expect(target.data.label).toEqual(label)
  })

  test("update node with duplicated label -> error", () => {
    let target = getNode(N1_ID)
    const originalLabel = target.data.label

    const duplicatedLabel = "test-router"

    const result = updateNodeLabel(N1_ID, duplicatedLabel)
    expect(result instanceof Error).toBeTruthy()

    target = getNode(N1_ID)
    expect(target.data.label).toEqual(originalLabel)
  })

  test("update non-existent node is a no-op", () => {
    const before = getNodesView()
    act(() => void updateNodeLabel("fakeid", "test-label"))
    const after = getNodesView()
    expect(before).toEqual(after)
  })
})

describe("update node description", () => {
  test("update node description success", () => {
    const description = "testing description update"
    act(() => updateNodeDescription(N1_ID, description))

    const actual = renderAndUnwrapHook(() => useGetNodeDescription(N1_ID))
    expect(actual).toEqual(description)
  })

  test("update non-existent node throws error", () => {
    expect(() => updateNodeDescription("fakeid", "test")).toThrowError()
  })
})

describe("updating EIP Attributes", () => {
  test.each([
    {
      msg: "add root node attr",
      nodeId: N2_ID,
      parentId: ROOT_PARENT,
      attribute: {
        name: "foo",
        value: "bar",
      },
    },
    {
      msg: "add the first attr for a root node",
      nodeId: N1_ID,
      parentId: ROOT_PARENT,
      attribute: {
        name: "foo",
        value: "bar",
      },
    },
    {
      msg: "add child node attr",
      nodeId: "poller",
      parentId: N1_ID,
      attribute: {
        name: "child-foo",
        value: "child-bar",
      },
    },
    {
      msg: "add the first attr for a child node",
      nodeId: "transactional",
      parentId: "MrMneIdthg",
      attribute: {
        name: "child-foo",
        value: "child-bar",
      },
    },
  ])("$msg", ({ nodeId, parentId, attribute }) => {
    act(() =>
      updateEipAttribute(nodeId, parentId, attribute.name, attribute.value)
    )

    const actual = renderAndUnwrapHook(() =>
      useGetEipAttribute(nodeId, parentId, attribute.name)
    )
    expect(actual).toEqual(attribute.value)
  })

  test.each([
    {
      msg: "overwrite root node attr",
      nodeId: N2_ID,
      parentId: ROOT_PARENT,
      attribute: {
        name: "phase",
        value: "last",
      },
    },
    {
      msg: "overwrite child node attr",
      nodeId: "poller",
      parentId: N1_ID,
      attribute: {
        name: "fixed-rate",
        value: 500,
      },
    },
  ])("$msg", ({ nodeId, parentId, attribute }) => {
    // assert attribute actually exists before updating
    let actual = renderAndUnwrapHook(() =>
      useGetEipAttribute(nodeId, parentId, attribute.name)
    )
    expect(actual).toBeTruthy()
    expect(actual).not.toEqual(attribute.value)

    act(() =>
      updateEipAttribute(nodeId, parentId, attribute.name, attribute.value)
    )

    actual = renderAndUnwrapHook(() =>
      useGetEipAttribute(nodeId, parentId, attribute.name)
    )
    expect(actual).toEqual(attribute.value)
  })

  test.each([
    {
      msg: "update non-existent root node",
      nodeId: "fakeid",
      parentId: ROOT_PARENT,
    },
    {
      msg: "update non-existent parent node",
      nodeId: "poller",
      parentId: "fakeid",
    },
    {
      msg: "update non-existent child node",
      nodeId: "fakeid",
      parentId: N1_ID,
    },
  ])("$msg", ({ nodeId, parentId }) => {
    const attribute = { name: "foo", value: "bar" }

    expect(() =>
      updateEipAttribute(nodeId, parentId, attribute.name, attribute.value)
    ).toThrowError()
  })
})

describe("deleting EIP Attributes", () => {
  test.each([
    {
      msg: "delete existing root node attribute success",
      nodeId: N2_ID,
      parentId: ROOT_PARENT,
      attrName: "phase",
    },
    {
      msg: "delete existing child node attribute success",
      nodeId: "poller",
      parentId: N1_ID,
      attrName: "fixed-rate",
    },
  ])("$msg", ({ nodeId, parentId, attrName }) => {
    // assert attribute exists before deleting
    let attribute = renderAndUnwrapHook(() =>
      useGetEipAttribute(nodeId, parentId, attrName)
    )
    expect(attribute).toBeTruthy()

    act(() => deleteEipAttribute(nodeId, parentId, attrName))

    attribute = renderAndUnwrapHook(() =>
      useGetEipAttribute(nodeId, parentId, attrName)
    )
    expect(attribute).toBeUndefined()
  })

  test.each([
    {
      msg: "delete non-existent root node attribute is a no-op",
      nodeId: N2_ID,
      parentId: ROOT_PARENT,
    },
    {
      msg: "delete non-existent child node attribute is a no-op",
      nodeId: "poller",
      parentId: N1_ID,
    },
  ])("$msg", ({ nodeId, parentId }) => {
    const attrName = "fakeattr"

    act(() => deleteEipAttribute(nodeId, parentId, attrName))

    const attribute = renderAndUnwrapHook(() =>
      useGetEipAttribute(nodeId, parentId, attrName)
    )
    expect(attribute).toBeUndefined()
  })
})

describe("mapping a dynamic router edge", () => {
  test("update a dynamic routing edge mapping success", () => {
    const edgeId = "reactflow__edge-LoiC2CFbLPoutput-SV43RVeijQinput"
    const mapping: ChannelMapping = {
      mapperName: "test-mapping",
      matcher: { name: "test-match-attr", type: "string" },
      matcherValue: "abc",
    }

    act(() => updateDynamicEdgeMapping(edgeId, mapping))

    const edge = getEdgesView().find((edge) => edge.id === edgeId)!
    const data = edge.data as DynamicEdgeData
    expect(data.mapping).toEqual(mapping)
  })

  test("update a default edge throws an error", () => {
    const edgeId = "reactflow__edge-9KWCqlIyy7output-LoiC2CFbLPinput"
    const mapping: ChannelMapping = {
      mapperName: "test-mapping",
      matcher: { name: "test-match-attr", type: "string" },
      matcherValue: "abc",
    }

    expect(() => updateDynamicEdgeMapping(edgeId, mapping)).toThrowError()
  })
})

describe("update content router key", () => {
  test("update existing content router key success", () => {
    const attrName = "expression"
    const attrValue = "bar"
    const routerKey: RouterKey = {
      name: "test-key",
      attributes: { [attrName]: attrValue },
    }

    act(() =>
      updateContentRouterKey(N2_ID, routerKey.name, attrName, attrValue)
    )

    const actual = renderAndUnwrapHook(() => useGetContentRouterKey(N2_ID))
    expect(actual).toEqual(routerKey)
  })

  test("create new content router key success", () => {
    act(() => resetMockStore(unspecifiedRouterFlow))
    const routerId = "ihLSJU8QVc"

    const attrName = "expression"
    const attrValue = "bar"
    const routerKey: RouterKey = {
      name: "test-key",
      attributes: { [attrName]: attrValue },
    }

    act(() =>
      updateContentRouterKey(routerId, routerKey.name, attrName, attrValue)
    )

    const actual = renderAndUnwrapHook(() => useGetContentRouterKey(routerId))
    expect(actual).toEqual(routerKey)
  })

  test("add additional router key attribute success", () => {
    const initialKey = renderAndUnwrapHook(() => useGetContentRouterKey(N2_ID))

    const attrName = "foo"
    const attrValue = "bar"
    const routerKey: RouterKey = {
      name: "test-key",
      attributes: { ...initialKey?.attributes, [attrName]: attrValue },
    }

    act(() =>
      updateContentRouterKey(N2_ID, routerKey.name, attrName, attrValue)
    )

    const actual = renderAndUnwrapHook(() => useGetContentRouterKey(N2_ID))
    expect(actual).toEqual(routerKey)
  })

  // TODO: unskip this test once action is fixed
  test.skip("update non-router node throws error", () => {
    expect(() =>
      updateContentRouterKey(N1_ID, "test-key", "foo", "bar")
    ).toThrowError()
  })

  test("update non-existent node throws error", () => {
    expect(() =>
      updateContentRouterKey("fakeid", "test-key", "foo", "bar")
    ).toThrowError()
  })
})

test("update enabled children success", () => {
  const children = ["child1", "child2"]

  act(() => updateEnabledChildren(N2_ID, children))

  const actual = renderAndUnwrapHook(() => useGetChildren(N2_ID))
  expect(actual).toEqual(children)
})

test("update selected child node success", () => {
  const childId: ChildNodeId = {
    name: "poller",
    parentNodeId: N2_ID,
  }

  act(() => updateSelectedChildNode(childId))

  const actual = renderAndUnwrapHook(useGetSelectedChildNode)
  expect(actual).toEqual(childId)
})

test("clear flow success", () => {
  act(() => clearFlow())

  const nodes = getNodesView()
  const edges = getEdgesView()
  const selectedChildNode = renderAndUnwrapHook(useGetSelectedChildNode)

  expect(nodes).toHaveLength(0)
  expect(edges).toHaveLength(0)
  expect(selectedChildNode).toBeNull()
})

test("clear root node selections from diagram success", () => {
  // Initialize store
  act(() => {
    resetMockStore(selectedNodeFlow)
  })

  // assert a selected node is present before clearing
  let selected = getNodesView().find((n) => n.selected)
  expect(selected).not.toBeUndefined()

  act(() => clearDiagramSelections())

  selected = getNodesView().find((n) => n.selected)
  expect(selected).toBeUndefined()
})

describe("import flow from an exported JSON file", () => {
  test("import a valid flow", () => {
    const initNodes = getNodesView()

    act(() => importFlowFromJson(validExportedFlow))

    const updatedState = {
      nodes: getNodesView(),
      edges: getEdgesView(),
      children: getNodesView().map((node) => ({
        [node.id]: renderAndUnwrapHook(() => useGetChildren(node.id)),
      })),
    }

    expect(updatedState.nodes).not.toEqual(initNodes)
    expect(updatedState).toMatchSnapshot()
  })

  test.each([{ key: "nodes" }, { key: "edges" }, { key: "eipNodeConfigs" }])(
    "import a malformed flow (missing '$key' field) is a no-op",
    ({ key }) => {
      const initialNodes = getNodesView()
      const initialEdges = getEdgesView()

      // Invalidate the flow JSON
      const flow = JSON.parse(validExportedFlow) as Record<string, object>
      delete flow[key]

      act(() => importFlowFromJson(JSON.stringify(flow)))

      expect(getNodesView()).toEqual(initialNodes)
      expect(getEdgesView()).toEqual(initialEdges)
    }
  )
})

describe("update layout orientation", () => {
  test.each([
    {
      orientation: "horizontal",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      orientation: "vertical",
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
  ])(
    "set to $orientation",
    ({ orientation, sourcePosition, targetPosition }) => {
      act(() => updateLayoutOrientation(orientation as Layout["orientation"]))

      expect(getLayoutView().orientation).toEqual(orientation)

      getNodesView().forEach((node) => {
        expect(node.sourcePosition).toEqual(sourcePosition)
        expect(node.targetPosition).toEqual(targetPosition)
      })
    }
  )
})

test("toggle layout density", () => {
  expect(getLayoutView().density).toEqual("comfortable")

  const initialPositions = getNodePositions()

  act(() => toggleLayoutDensity())
  const compactPositions = getNodePositions()
  expect(compactPositions).not.toEqual(initialPositions)
  expect(getLayoutView().density).toEqual("compact")

  act(() => toggleLayoutDensity())
  const comfortablePositions = getNodePositions()
  expect(comfortablePositions).not.toEqual(compactPositions)
  expect(getLayoutView().density).toEqual("comfortable")
})
