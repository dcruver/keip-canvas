import { create } from "zustand"

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
  XYPosition,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow"
import { useShallow } from "zustand/react/shallow"
import { EipId } from "../api/eipId"
import { EIP_NODE_KEY, EipFlowNode } from "../api/flow"
import { lookupEipComponent } from "./eipDefinitions"

interface FlowActions {
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

type AttributeTypes = string | boolean

interface EipNodeConfig {
  attributes: Record<string, AttributeTypes>
  children: Record<string, string>
}

interface AppActions {
  createDroppedNode: (eipId: EipId, position: XYPosition) => void

  updateNodeLabel: (nodeId: string, label: string) => void

  updateAttributeConfig: (
    nodeId: string,
    attrName: string,
    value: AttributeTypes
  ) => void

  updateChildConfig: (nodeId: string, children: string[]) => void
}

interface AppStore {
  nodes: EipFlowNode[]
  edges: Edge[]
  eipConfigs: Record<string, EipNodeConfig>

  flowActions: FlowActions
  appActions: AppActions
}

const useStore = create<AppStore>()((set) => ({
  nodes: [],
  edges: [],
  eipConfigs: {},

  flowActions: {
    onNodesChange: (changes: NodeChange[]) =>
      set((state) => {
        const updates: Partial<AppStore> = {
          nodes: applyNodeChanges(changes, state.nodes),
        }

        const updatedEipConfigs = removeDeletedNodeConfigs(state, changes)
        if (updatedEipConfigs) {
          updates.eipConfigs = updatedEipConfigs
        }

        return updates
      }),

    onEdgesChange: (changes: EdgeChange[]) =>
      set((state) => ({
        edges: applyEdgeChanges(changes, state.edges),
      })),

    onConnect: (connection: Connection) =>
      set((state) => ({
        edges: addEdge(connection, state.edges),
      })),
  },

  appActions: {
    createDroppedNode: (eipId, position) =>
      set((state) => {
        const node = newNode(eipId, position)
        return {
          nodes: [...state.nodes, node],
          eipConfigs: {
            ...state.eipConfigs,
            [node.id]: { attributes: {}, children: {} },
          },
        }
      }),
    updateNodeLabel: (id, label) =>
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, label } } : node
        ),
      })),

    updateAttributeConfig(nodeId, attrName, value) {
      set((state) => {
        const configs = { ...state.eipConfigs }
        configs[nodeId].attributes[attrName] = value
        return { eipConfigs: configs }
      })
    },

    updateChildConfig(nodeId, children) {
      set((state) => {
        const configs = { ...state.eipConfigs }
        configs[nodeId].children = children.reduce((accum, child) => {
          accum[child] = ""
          return accum
        }, {} as Record<string, string>)

        return { eipConfigs: configs }
      })
    },
  },
}))

const newNode = (eipId: EipId, position: XYPosition) => {
  const id = nanoid(10)
  const nodeSchema = lookupEipComponent(eipId)!
  const node: EipFlowNode = {
    id: id,
    type: EIP_NODE_KEY,
    position: position,
    data: {
      eipId: eipId,
      label: "New Node",
      flowType: nodeSchema.flowType,
      role: nodeSchema.role,
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
  const updatedConfigs = { ...state.eipConfigs }
  deletes.forEach((c) => delete updatedConfigs[c.id])
  return updatedConfigs
}

export const useGetNode = (id: string): EipFlowNode | undefined =>
  useStore(useShallow((state) => state.nodes.find((node) => node.id === id)))

export const useNodeCount = () => useStore((state) => state.nodes.length)

export const useGetAttributeValue = (id: string, attrName: string) =>
  useStore((state) => state.eipConfigs[id]?.attributes[attrName])

export const useGetChildren = (id: string) =>
  useStore(
    (state) =>
      state.eipConfigs[id] && Object.keys(state.eipConfigs[id].children)
  )

export const useFlowStore = () =>
  useStore(
    useShallow((state: AppStore) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.flowActions.onNodesChange,
      onEdgesChange: state.flowActions.onEdgesChange,
      onConnect: state.flowActions.onConnect,
    }))
  )

export const useAppActions = () => useStore((state) => state.appActions)
