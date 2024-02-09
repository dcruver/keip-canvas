import ReactFlow, { Background, BackgroundVariant, Controls } from "reactflow"

import { useShallow } from "zustand/react/shallow"
import useStore, { FlowState } from "./store"

import "reactflow/dist/base.css"

import EIPNode from "./customnodes/EIPNode"

const nodeTypes = {
  eipNode: EIPNode,
}

const selector = (state: FlowState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
})

const FlowCanvas = () => {
  const store = useStore(useShallow(selector))

  return (
    <div style={{ width: "100%", height: "calc(100vh - 3rem)" }}>
      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.onConnect}
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
