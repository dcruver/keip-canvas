import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
} from "reactflow"

import { useAppActions, useFlowStore } from "../store"

import "reactflow/dist/base.css"

import { useDrop } from "react-dnd"
import { EipId } from "../api/eip"
import EIPNode from "../custom-nodes/EIPNode"
import { DragTypes } from "../node-chooser/dragTypes"

const nodeTypes = {
  eipNode: EIPNode,
}

const FlowCanvas = () => {
  const reactFlowInstance = useReactFlow()
  const flowStore = useFlowStore()
  const { createDroppedNode } = useAppActions()

  const [_, drop] = useDrop<EipId, unknown, unknown>(
    () => ({
      accept: DragTypes.FLOWNODE,
      drop: (eipId, monitor) => {
        let offset = monitor.getClientOffset()
        offset = offset === null ? { x: 0, y: 0 } : offset
        const pos = reactFlowInstance.screenToFlowPosition(offset)
        createDroppedNode(eipId, pos)
      },
    }),
    [reactFlowInstance]
  )

  return (
    <div style={{ width: "100%", height: "calc(100vh - 3rem)" }} ref={drop}>
      <ReactFlow
        nodes={flowStore.nodes}
        edges={flowStore.edges}
        onNodesChange={flowStore.onNodesChange}
        onEdgesChange={flowStore.onEdgesChange}
        onConnect={flowStore.onConnect}
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
