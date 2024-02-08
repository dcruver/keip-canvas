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

export interface FlowState {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

const initialNodes: Node[] = [
  { id: "1", type: "example", position: { x: 0, y: 0 }, data: { label: "1" } },
  {
    id: "2",
    type: "example",
    position: { x: 0, y: 100 },
    data: { label: "2" },
  },
]
const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }]

const useStore = create<FlowState>()((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

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
