import { create } from "zustand"

import { nanoid } from "nanoid/non-secure"
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  XYPosition,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow"
import { useShallow } from "zustand/react/shallow"
import { EipId } from "./api/eip"
import { EipNodeData, eipNodeKey } from "./custom-nodes/EIPNode"
import { lookupEipComponent } from "./schema/componentSchema"

interface FlowActions {
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

interface AppActions {
  createDroppedNode: (eipId: EipId, position: XYPosition) => void
  updateNodeLabel: (nodeId: string, label: string) => void
}

interface AppStore {
  nodes: Node[]
  edges: Edge[]

  flowActions: FlowActions
  appActions: AppActions
}

const useStore = create<AppStore>()((set) => ({
  nodes: [],
  edges: [],

  flowActions: {
    onNodesChange: (changes: NodeChange[]) =>
      set((state) => ({
        nodes: applyNodeChanges(changes, state.nodes),
      })),

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
      set((state) => ({
        nodes: [...state.nodes, newNode(eipId, position)],
      })),
    updateNodeLabel: (id, label) =>
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, label } } : node
        ),
      })),
  },
}))

const newNode = (eipId: EipId, position: XYPosition) => {
  const id = nanoid(10)
  const nodeSchema = lookupEipComponent(eipId)!
  const node: Node<EipNodeData> = {
    id: id,
    type: eipNodeKey,
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

export const useGetNode = (id: string) =>
  useStore(useShallow((state) => state.nodes.find((node) => node.id === id)))

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
