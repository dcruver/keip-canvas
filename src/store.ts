import { create } from "zustand"

import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow"
import { EipNodeData, FlowType } from "./customnodes/EIPNode"

export interface FlowState {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

const initialNodes: Node<EipNodeData>[] = [
  {
    id: "1",
    type: "eipNode",
    position: { x: 0, y: 0 },
    data: {
      eipName: "inbound-channel-adapter",
      label: "Adapter1",
      flowType: FlowType.Source,
    },
  },
  // {
  //   id: "2",
  //   type: "eipNode",
  //   position: { x: 300, y: 300 },
  //   data: { label: "2" },
  // },
]
// const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }]

const useStore = create<FlowState>()((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    })
  },
}))

export default useStore
