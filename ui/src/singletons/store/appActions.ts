// TODO: Bugfix. Nested updates of the 'eipNodeConfigs' store field are mutating
// references to the current state, this could lead to subtle bugs. Modify a deep
// copy of the state object and return that instead. Consider using Immer.

import { nanoid } from "nanoid/non-secure"
import { Edge, Position, XYPosition } from "reactflow"
import {
  ChannelMapping,
  DYNAMIC_EDGE_TYPE,
  DynamicEdge,
  EIP_NODE_TYPE,
  EipFlowNode,
  Layout,
} from "../../api/flow"
import { AttributeType } from "../../api/generated/eipComponentDef"
import { ChildNodeId, EipId, ROOT_PARENT } from "../../api/id"
import { newFlowLayout } from "../../components/layout/layouting"
import { AppStore, EipNodeConfig } from "./api"
import { useAppStore } from "./appStore"

export const createDroppedNode = (eipId: EipId, position: XYPosition) =>
  useAppStore.setState((state) => {
    const node = newNode(eipId, position, state.layout.orientation)
    return {
      nodes: [...state.nodes, node],
      eipNodeConfigs: {
        ...state.eipNodeConfigs,
        [node.id]: { attributes: {}, children: {} },
      },
    }
  })

export const updateNodeLabel = (id: string, label: string) => {
  let error: Error | undefined
  useAppStore.setState((state) => {
    const updatedNodes = state.nodes.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, label } }
      } else {
        if (node.data.label === label) {
          error = new Error("Node labels must be unique")
        }
        return node
      }
    })
    return { nodes: error ? state.nodes : updatedNodes }
  })
  return error
}

export const updateNodeDescription = (id: string, description: string) =>
  useAppStore.setState((state) => {
    const configs = { ...state.eipNodeConfigs }
    configs[id].description = description
    return { eipNodeConfigs: configs }
  })

export const updateEipAttribute = (
  id: string,
  parentId: string,
  attrName: string,
  value: AttributeType
) =>
  useAppStore.setState((state) => {
    const configs = { ...state.eipNodeConfigs }
    if (parentId === ROOT_PARENT) {
      configs[id].attributes[attrName] = value
    } else {
      const children = configs[parentId].children
      configs[parentId].children = {
        ...children,
        [id]: {
          ...children[id],
          attributes: {
            ...children[id].attributes,
            [attrName]: value,
          },
        },
      }
    }
    return { eipNodeConfigs: configs }
  })

export const deleteEipAttribute = (
  id: string,
  parentId: string,
  attrName: string
) =>
  useAppStore.setState((state) => {
    const nodeConfigs = state.eipNodeConfigs
    if (parentId === ROOT_PARENT) {
      const updatedAttrs = { ...nodeConfigs[id].attributes }
      delete updatedAttrs[attrName]
      return {
        eipNodeConfigs: {
          ...nodeConfigs,
          [id]: { ...nodeConfigs[id], attributes: updatedAttrs },
        },
      }
    } else {
      const updatedAttrs = {
        ...nodeConfigs[parentId].children[id].attributes,
      }
      delete updatedAttrs[attrName]
      return {
        eipNodeConfigs: {
          ...nodeConfigs,
          [parentId]: {
            ...nodeConfigs[parentId],
            children: {
              ...nodeConfigs[parentId].children,
              [id]: {
                ...nodeConfigs[parentId].children[id],
                attributes: updatedAttrs,
              },
            },
          },
        },
      }
    }
  })

// TODO: Ensure no more than one default mapping edge can be set
export const updateDynamicEdgeMapping = (
  edgeId: string,
  mapping: Partial<ChannelMapping>
) =>
  useAppStore.setState((state) => ({
    edges: state.edges.map((edge) => {
      if (edge.id === edgeId) {
        const dynamic = validateDynamicEdgeType(edge)
        return {
          ...dynamic,
          data: {
            ...dynamic.data,
            mapping: { ...dynamic.data?.mapping, ...mapping },
          },
        }
      }
      return edge
    }),
  }))

export const updateContentRouterKey = (
  nodeId: string,
  keyName: string,
  attrName: string,
  value: AttributeType
) =>
  useAppStore.setState((state) => ({
    eipNodeConfigs: {
      ...state.eipNodeConfigs,
      [nodeId]: {
        ...state.eipNodeConfigs[nodeId],
        routerKey: {
          name: keyName,
          attributes: {
            ...state.eipNodeConfigs[nodeId].routerKey?.attributes,
            [attrName]: value,
          },
        },
      },
    },
  }))

export const updateEnabledChildren = (nodeId: string, children: string[]) =>
  useAppStore.setState((state) => {
    const configs = { ...state.eipNodeConfigs }
    configs[nodeId].children = children.reduce(
      (accum, name) => {
        accum[name] = { name }
        return accum
      },
      {} as EipNodeConfig["children"]
    )

    return { eipNodeConfigs: configs }
  })

export const updateSelectedChildNode = (childId: ChildNodeId) =>
  useAppStore.setState(() => ({ selectedChildNode: childId }))

export const clearSelectedChildNode = () =>
  useAppStore.setState(() => ({ selectedChildNode: null }))

export const clearFlow = () =>
  useAppStore.setState(() => ({
    nodes: [],
    edges: [],
    eipNodeConfigs: {},
    selectedChildNode: null,
  }))

export const clearDiagramSelections = () =>
  useAppStore.setState((state) => ({
    nodes: state.nodes.map((node) => ({ ...node, selected: false })),
    edges: state.edges.map((edge) => ({ ...edge, selected: false })),
  }))

// TODO: Should importing throw an error on failure instead?
export const importFlowFromJson = (json: string) =>
  useAppStore.setState(() => {
    const imported = JSON.parse(json) as Partial<AppStore>
    if (isStoreType(imported)) {
      return {
        nodes: imported.nodes,
        edges: imported.edges,
        eipNodeConfigs: imported.eipNodeConfigs,
      }
    }
    console.error("Failed to import an EIP flow JSON. Malformed input")
    return {}
  })

export const updateLayoutOrientation = (orientation: Layout["orientation"]) =>
  useAppStore.setState((state) => {
    const newLayout: Layout = {
      ...state.layout,
      orientation: orientation,
    }
    const nodes = newFlowLayout(state.nodes, state.edges, newLayout)
    return {
      nodes: nodes,
      layout: newLayout,
    }
  })

export const toggleLayoutDensity = () =>
  useAppStore.setState((state) => {
    const newDensity =
      state.layout.density === "compact" ? "comfortable" : "compact"
    const newLayout: Layout = {
      ...state.layout,
      density: newDensity,
    }
    const nodes = newFlowLayout(state.nodes, state.edges, newLayout)
    return {
      nodes: nodes,
      layout: newLayout,
    }
  })

const newNode = (
  eipId: EipId,
  position: XYPosition,
  orientation: Layout["orientation"]
) => {
  const id = nanoid(10)
  const isHorizontal = orientation === "horizontal"
  const node: EipFlowNode = {
    id: id,
    type: EIP_NODE_TYPE,
    position: position,
    targetPosition: isHorizontal ? Position.Left : Position.Top,
    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    data: {
      eipId: eipId,
    },
  }
  return node
}

const validateDynamicEdgeType = (edge: Edge) => {
  if (edge.type !== DYNAMIC_EDGE_TYPE) {
    throw new Error(
      `The provided edge did not have the expected type: "${edge.type}". Should be "${DYNAMIC_EDGE_TYPE}"`
    )
  }
  return edge as DynamicEdge
}

const isStoreType = (state: unknown): state is AppStore => {
  const store = state as AppStore
  return (
    store.nodes !== undefined &&
    store.edges !== undefined &&
    store.eipNodeConfigs !== undefined
  )
}
