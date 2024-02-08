import { useCallback } from "react"
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  OnConnect,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow"

import "reactflow/dist/style.css"
import ExampleNode from "./customnodes/example"

const nodeTypes = {
  example: ExampleNode,
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

const FlowCanvas = () => {
  const [nodes, _, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: "100%", height: "calc(100vh - 3rem)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        {/* <MiniMap /> */}
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

export default FlowCanvas
