import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
} from "reactflow"

import { useShallow } from "zustand/react/shallow"
import useStore, { FlowState } from "../store"

import "reactflow/dist/base.css"

import { useDrop } from "react-dnd"
import EIPNode from "../custom-nodes/EIPNode"
import { DragTypes } from "../node-chooser/dragTypes"

export type FlowNodeData = {
  name: string
}

const nodeTypes = {
  eipNode: EIPNode,
}

const selector = (state: FlowState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,

  createDroppedNode: state.createDroppedNode,
})

const FlowCanvas = () => {
  const reactFlowInstance = useReactFlow()
  const state = useStore(useShallow(selector))

  const [_, drop] = useDrop<FlowNodeData, unknown, unknown>(
    () => ({
      accept: DragTypes.FLOWNODE,
      drop: (item, monitor) => {
        let offset = monitor.getClientOffset()
        offset = offset === null ? { x: 0, y: 0 } : offset
        const pos = reactFlowInstance.screenToFlowPosition(offset)
        state.createDroppedNode(item.name, pos)
      },
    }),
    [reactFlowInstance]
  )

  return (
    <div style={{ width: "100%", height: "calc(100vh - 3rem)" }} ref={drop}>
      <ReactFlow
        nodes={state.nodes}
        edges={state.edges}
        onNodesChange={state.onNodesChange}
        onEdgesChange={state.onEdgesChange}
        onConnect={state.onConnect}
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
