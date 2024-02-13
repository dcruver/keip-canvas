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
import { FlowType } from "./compnentSchema"
import { EipNodeData, eipNodeKey } from "./customnodes/EIPNode"

export interface FlowState {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect

  createDroppedNode: (eipName: string, position: XYPosition) => void
}

// const initialNodes: Node<EipNodeData>[] = [
//   {
//     id: "1",
//     type: eipNodeKey,
//     position: { x: 0, y: 0 },
//     data: {
//       eipName: "inbound-channel-adapter",
//       label: "Adapter1",
//       flowType: FlowType.Source,
//     },
//   },
// ]

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

const useStore = create<FlowState>()((set) => ({
  nodes: [],
  edges: [],

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

  createDroppedNode: (eipName, position) =>
    set((state) => ({
      nodes: [...state.nodes, newNode(eipName, position)],
    })),
}))

export default useStore
