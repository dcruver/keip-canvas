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
import { EipNodeData, eipNodeKey } from "./custom-nodes/EIPNode"
import { FlowType } from "./schema/compnentSchema"

interface FlowActions {
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

interface AppActions {
  createDroppedNode: (eipName: string, position: XYPosition) => void
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
    createDroppedNode: (eipName, position) =>
      set((state) => ({
        nodes: [...state.nodes, newNode(eipName, position)],
      })),
  },
}))

const newNode = (eipName: string, position: XYPosition) => {
  const id = nanoid(10)
  const node: Node<EipNodeData> = {
    id: id,
    type: eipNodeKey,
    position: position,
    data: {
      eipName: eipName,
      label: "New Node",
      flowType: FlowType.Passthru,
    },
  }
  return node
}

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
