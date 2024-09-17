import isDeepEqual from "fast-deep-equal"
import { temporal } from "zundo"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import debounce from "../utils/debounce"

import { nanoid } from "nanoid/non-secure"
import {
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  NodeRemoveChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Position,
  XYPosition,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow"
import { useShallow } from "zustand/react/shallow"
import { useStoreWithEqualityFn } from "zustand/traditional"
import {
  ChannelMapping,
  DYNAMIC_EDGE_TYPE,
  DynamicEdge,
  EIP_NODE_TYPE,
  EipFlowNode,
  EipNodeData,
  Layout,
  RouterKey,
} from "../api/flow"
import { AttributeType, EipComponent } from "../api/generated/eipComponentDef"
import {
  Attributes,
  EipChildNode,
  EipFlow,
  EipNode,
  FlowEdge,
} from "../api/generated/eipFlow"
import { ChildNodeId, EipId, areChildIdsEqual } from "../api/id"
import { newFlowLayout } from "../components/layout/layouting"
import {
  CHANNEL_ATTR_NAME,
  DEFAULT_OUTPUT_CHANNEL_NAME,
  DYNAMIC_ROUTING_CHILDREN,
  lookupContentBasedRouterKeys,
  lookupEipComponent,
} from "./eipDefinitions"

// TODO: Refactor store into smaller, more manageable pieces.

export const ROOT_PARENT = "root"

const NO_PERSIST = new Set(["appActions", "reactFlowActions"])

interface ReactFlowActions {
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

interface EipNodeConfig {
  attributes: Attributes
  children: Record<string, EipChildNode>
  description?: string
  routerKey?: RouterKey
}

// TODO: Bugfix. Nested updates of the 'eipNodeConfigs' store field are mutating
// references to the current state, this could lead to subtle bugs. Modify a deep
// copy of the state object and return that instead. Consider using Immer.
interface AppActions {
  createDroppedNode: (eipId: EipId, position: XYPosition) => void

  updateNodeLabel: (nodeId: string, label: string) => Error | undefined

  updateNodeDescription: (nodeId: string, description: string) => void

  updateEipAttribute: (
    id: string,
    parentId: string,
    attrName: string,
    value: AttributeType
  ) => void

  deleteEipAttribute: (id: string, parentId: string, attrName: string) => void

  updateDynamicEdgeMapping: (
    edgeId: string,
    mapping: Partial<ChannelMapping>
  ) => void

  updateContentRouterKey: (
    nodeId: string,
    keyName: string,
    attrName: string,
    value: AttributeType
  ) => void

  updateEnabledChildren: (nodeId: string, children: string[]) => void

  updateSelectedChildNode: (childId: ChildNodeId) => void

  clearSelectedChildNode: () => void

  clearFlow: () => void

  clearDiagramSelections: () => void

  importFlowFromJson: (json: string) => void

  updateLayoutOrientation: (orientation: Layout["orientation"]) => void

  updateLayoutDensity: () => void
}

interface AppStore {
  nodes: EipFlowNode[]
  edges: Edge[]
  eipNodeConfigs: Record<string, EipNodeConfig>
  selectedChildNode: ChildNodeId | null
  layout: Layout

  reactFlowActions: ReactFlowActions
  appActions: AppActions
}

// If app becomes too slow, might need to switch to async persistent storage.
const useStore = create<AppStore>()(
  persist(
    temporal(
      (set) => ({
        nodes: [],
        edges: [],
        eipNodeConfigs: {},
        selectedChildNode: null,
        layout: {
          orientation: "horizontal",
          density: "comfortable",
        },

        reactFlowActions: {
          onNodesChange: (changes: NodeChange[]) =>
            set((state) => {
              const updates: Partial<AppStore> = {
                nodes: applyNodeChanges(changes, state.nodes),
              }

              const updatedEipConfigs = removeDeletedNodeConfigs(state, changes)
              if (updatedEipConfigs) {
                updates.eipNodeConfigs = updatedEipConfigs
              }

              return updates
            }),

          // TODO: Use the new 'selectable` DefaultEdgeProp after migrating to ReactFlow v12.
          // Only dynamic router edges should be selectable.
          onEdgesChange: (changes: EdgeChange[]) =>
            set((state) => ({
              edges: applyEdgeChanges(changes, state.edges),
            })),

          onConnect: (connection: Connection) =>
            set((state) => {
              const sourceNode = state.nodes.find(
                (n) => n.id === connection.source
              )
              const sourceComponent =
                sourceNode && lookupEipComponent(sourceNode.data.eipId)
              const edge =
                sourceComponent?.role === "router"
                  ? createDynamicRoutingEdge(connection, sourceComponent)
                  : connection
              return {
                edges: addEdge(edge, state.edges),
              }
            }),
        },

        appActions: {
          createDroppedNode: (eipId, position) =>
            set((state) => {
              const node = newNode(eipId, position, state.layout.orientation)
              return {
                nodes: [...state.nodes, node],
                eipNodeConfigs: {
                  ...state.eipNodeConfigs,
                  [node.id]: { attributes: {}, children: {} },
                },
              }
            }),

          updateNodeLabel: (id, label) => {
            let error: Error | undefined
            set((state) => {
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
          },

          updateNodeDescription: (id, description) =>
            set((state) => {
              const configs = { ...state.eipNodeConfigs }
              configs[id].description = description
              return { eipNodeConfigs: configs }
            }),

          updateEipAttribute: (id, parentId, attrName, value) =>
            set((state) => {
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
            }),

          deleteEipAttribute: (id, parentId, attrName) =>
            set((state) => {
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
            }),

          // TODO: Ensure no more than one default mapping edge can be set
          updateDynamicEdgeMapping: (edgeId, mapping) =>
            set((state) => ({
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
            })),

          updateContentRouterKey: (nodeId, keyName: string, attrName, value) =>
            set((state) => ({
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
            })),

          updateEnabledChildren: (nodeId, children) =>
            set((state) => {
              const configs = { ...state.eipNodeConfigs }
              configs[nodeId].children = children.reduce(
                (accum, name) => {
                  accum[name] = { name }
                  return accum
                },
                {} as EipNodeConfig["children"]
              )

              return { eipNodeConfigs: configs }
            }),

          updateSelectedChildNode: (childId) =>
            set(() => ({ selectedChildNode: childId })),

          clearSelectedChildNode: () =>
            set(() => ({ selectedChildNode: null })),

          clearFlow: () =>
            set(() => ({
              nodes: [],
              edges: [],
              eipNodeConfigs: {},
              selectedChildNode: null,
            })),

          clearDiagramSelections: () =>
            set((state) => ({
              nodes: state.nodes.map((node) => ({ ...node, selected: false })),
              edges: state.edges.map((edge) => ({ ...edge, selected: false })),
            })),

          importFlowFromJson: (json: string) =>
            set(() => {
              const imported = JSON.parse(json) as Partial<AppStore>
              if (isStoreType(imported)) {
                return {
                  nodes: imported.nodes,
                  edges: imported.edges,
                  eipNodeConfigs: imported.eipNodeConfigs,
                }
              }
              console.error(
                "Failed to import an EIP flow JSON. Malformed input"
              )
              return {}
            }),

          updateLayoutOrientation: (orientation: Layout["orientation"]) =>
            set((state) => {
              const newLayout: Layout = {
                ...state.layout,
                orientation: orientation,
              }
              const nodes = newFlowLayout(state.nodes, state.edges, newLayout)
              return {
                nodes: nodes,
                layout: newLayout,
              }
            }),

          updateLayoutDensity: () =>
            set((state) => {
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
            }),
        },
      }),
      {
        limit: 50,

        partialize: (state) => {
          const newNodes = state.nodes.map((node) => {
            const n = { ...node }
            const { selected, draggable, dragging, positionAbsolute, ...rest } =
              n
            return rest
          })

          const { eipNodeConfigs, edges, layout } = state
          return { eipNodeConfigs, layout, edges, nodes: newNodes }
        },

        equality: (pastState, currentState) =>
          isDeepEqual(pastState, currentState),

        handleSet: (handleSet) =>
          debounce<typeof handleSet>((state) => handleSet(state), 1000, true),
      }
    ),
    {
      name: "eipFlow",
      version: 0,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !NO_PERSIST.has(key))
        ),
    }
  )
)

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

const removeDeletedNodeConfigs = (state: AppStore, changes: NodeChange[]) => {
  const deletes: NodeRemoveChange[] = changes.filter(
    (c) => c.type === "remove"
  ) as NodeRemoveChange[]

  if (deletes.length === 0) {
    return null
  }

  const updatedConfigs = { ...state.eipNodeConfigs }
  deletes.forEach((c) => delete updatedConfigs[c.id])
  return updatedConfigs
}

const isStoreType = (state: unknown): state is AppStore => {
  const store = state as AppStore
  return (
    store.nodes !== undefined &&
    store.edges !== undefined &&
    store.eipNodeConfigs !== undefined
  )
}

// TODO: Refactor
const createDynamicRoutingEdge = (
  connection: Connection,
  sourceComponent: EipComponent
) => {
  const channelMapper = sourceComponent?.childGroup?.children.find((child) =>
    DYNAMIC_ROUTING_CHILDREN.has(child.name)
  )
  if (!channelMapper) {
    throw new Error(
      `source component (${sourceComponent.name}) does not have a recognized channel mapping child`
    )
  }

  const matcher = channelMapper.attributes?.find(
    (attr) => attr.name !== CHANNEL_ATTR_NAME
  )
  if (!matcher) {
    throw new Error(
      `Channel mapping component (${channelMapper.name}) does not have a recognized value matcher attribute`
    )
  }

  return {
    ...connection,
    type: DYNAMIC_EDGE_TYPE,
    data: {
      mapping: {
        mapperName: channelMapper.name,
        matcher,
      },
    },
    animated: true,
  }
}

const validateDynamicEdgeType = (edge: Edge) => {
  if (edge.type !== DYNAMIC_EDGE_TYPE) {
    throw new Error(
      `The provided edge did not have the expected type: "${edge.type}". Should be "${DYNAMIC_EDGE_TYPE}"`
    )
  }
  return edge as DynamicEdge
}

export const useNodeCount = () => useStore((state) => state.nodes.length)

export const useGetNodes = () => useStore((state) => state.nodes)

export const useGetLayout = () => useStore((state) => state.layout)

export const useSerializedStore = () =>
  useStore((state) =>
    JSON.stringify({
      nodes: state.nodes,
      edges: state.edges,
      eipNodeConfigs: state.eipNodeConfigs,
    })
  )

export const useGetNodeDescription = (id: string) =>
  useStore((state) => state.eipNodeConfigs[id]?.description)

export const useGetEipAttribute = (
  id: string,
  parentId: string,
  attrName: string
) =>
  useStore((state) => {
    if (parentId === ROOT_PARENT) {
      return state.eipNodeConfigs[id]?.attributes[attrName]
    }
    const child = state.eipNodeConfigs[parentId]?.children[id]
    return child?.attributes?.[attrName]
  })

export const useGetChildren = (id: string) =>
  useStore(
    useShallow((state) =>
      state.eipNodeConfigs[id]
        ? Object.keys(state.eipNodeConfigs[id].children)
        : []
    )
  )

export const useGetSelectedChildNode = () =>
  useStore(useShallow((state) => state.selectedChildNode))

export const useIsChildSelected = (childId: ChildNodeId) =>
  useStore((state) => {
    if (state.selectedChildNode === null) {
      return false
    }
    return areChildIdsEqual(state.selectedChildNode, childId)
  })

export const useGetContentRouterKey = (nodeId: string) =>
  useStore(useShallow((state) => state.eipNodeConfigs[nodeId].routerKey))

export const useGetRouterDefaultEdgeMapping = (routerId: string) =>
  useStore((state) =>
    state.edges.find(
      (edge) =>
        edge.source === routerId &&
        edge.type === DYNAMIC_EDGE_TYPE &&
        (edge as DynamicEdge).data?.mapping.isDefaultMapping
    )
  )

export const useFlowStore = () =>
  useStore(
    useShallow((state: AppStore) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.reactFlowActions.onNodesChange,
      onEdgesChange: state.reactFlowActions.onEdgesChange,
      onConnect: state.reactFlowActions.onConnect,
    }))
  )

export const useUndoRedo = () =>
  useStore(() => ({
    undo: useStore.temporal.getState().undo,
    redo: useStore.temporal.getState().redo,
  }))

export const useAppActions = () => useStore((state) => state.appActions)

export const useEipFlow = () =>
  useStoreWithEqualityFn(
    useStore,
    (state) => diagramToEipFlow(state),
    isDeepEqual
  )

const EIP_NAMESPACE_TO_XML_PREFIX: Record<string, string> = {
  xml: "int-xml",
  "web-services": "ws",
}

// TODO: Extract flow conversion to a separate file
// TODO: Dynamic router logic is over-complicating this method, extract to
// a separate method and apply modifications after building original flow.
const diagramToEipFlow = (state: AppStore): EipFlow => {
  const nodeLookup = createNodeLookupMap(state.nodes)

  const routerChildMap = new Map<string, EipChildNode[]>()
  const routerAttrMap = new Map<string, Attributes>()

  const edges: FlowEdge[] = state.edges.map((edge) => {
    const source = nodeLookup.get(edge.source)?.label || edge.source
    const target = nodeLookup.get(edge.target)?.label || edge.target
    const edgeId = `ch-${source}-${target}`

    if (edge.type === DYNAMIC_EDGE_TYPE) {
      addRouterChannelMapping(edgeId, edge, routerChildMap, routerAttrMap)
    }

    return {
      id: edgeId,
      source,
      target,
      type: edge.sourceHandle === "discard" ? "discard" : "default",
    }
  })

  const nodes: EipNode[] = state.nodes.map((node) => {
    const eipComponent = lookupEipComponent(node.data.eipId)!
    const namespace = node.data.eipId.namespace

    const routerKey = state.eipNodeConfigs[node.id].routerKey
    const routerKeyAttrs =
      eipComponent.role === "router" && routerKey
        ? getRouterKeyAttributes(node.data.eipId, routerKey)
        : {}

    return {
      id: node.data.label ? node.data.label : node.id,
      eipId: {
        ...node.data.eipId,
        namespace: EIP_NAMESPACE_TO_XML_PREFIX[namespace] ?? namespace,
      },
      description: state.eipNodeConfigs[node.id]?.description,
      role: eipComponent.role,
      connectionType: eipComponent.connectionType,
      attributes: {
        ...state.eipNodeConfigs[node.id]?.attributes,
        ...routerKeyAttrs.attributes,
        ...routerAttrMap.get(node.id),
      },
      children: Object.values(state.eipNodeConfigs[node.id]?.children).concat(
        routerKeyAttrs.child ?? [],
        routerChildMap.get(node.id) ?? []
      ),
    }
  })

  return { nodes, edges }
}

const createNodeLookupMap = (nodes: EipFlowNode[]) => {
  const map = new Map<string, EipNodeData>()
  nodes.forEach((node) => map.set(node.id, node.data))
  return map
}

// TODO: consider extracting the ChannelMapping and RouterKey logic to the XML translation backend
const addRouterChannelMapping = (
  channelId: string,
  edge: DynamicEdge,
  routerChildMap: Map<string, EipChildNode[]>,
  routerAttributeMap: Map<string, Attributes>
) => {
  const mapping = edge.data?.mapping
  if (!mapping) {
    return
  }

  if (mapping.isDefaultMapping) {
    routerAttributeMap.set(edge.source, {
      [DEFAULT_OUTPUT_CHANNEL_NAME]: channelId,
    })
  } else {
    const child: EipChildNode = {
      name: mapping.mapperName,
      attributes: {
        [CHANNEL_ATTR_NAME]: channelId,
      },
    }
    if (mapping.matcherValue) {
      child.attributes![mapping.matcher.name] = mapping.matcherValue
    }
    const curr = routerChildMap.get(edge.source) ?? []
    routerChildMap.set(edge.source, curr.concat(child))
  }
}

const getRouterKeyAttributes = (eipId: EipId, routerKey: RouterKey) => {
  const routerKeyDef = lookupContentBasedRouterKeys(eipId)
  if (!routerKeyDef) {
    return {}
  }
  switch (routerKeyDef.type) {
    case "attribute": {
      return { attributes: filterEmptyAttrs(routerKey.attributes ?? {}) }
    }
    case "child": {
      return {
        child: {
          name: routerKey.name,
          attributes: filterEmptyAttrs(routerKey.attributes ?? {}),
        },
      }
    }
  }
}

const filterEmptyAttrs = (attrs: Attributes) =>
  Object.keys(attrs).reduce((acc, key) => {
    const val = attrs[key]
    if (val) {
      acc[key] = val
    }
    return acc
  }, {} as Attributes)

// Warning: the following exports provide non-reactive access to the store's state
export const getNodesView: () => Readonly<EipFlowNode[]> = () =>
  useStore.getState().nodes
export const getEdgesView: () => Readonly<Edge[]> = () =>
  useStore.getState().edges
export const getLayout: () => Readonly<Layout> = () =>
  useStore.getState().layout
