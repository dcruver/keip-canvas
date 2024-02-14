import { ClickableTile } from "@carbon/react"
import { Handle, NodeProps, Position } from "reactflow"

import eipIconUrls from "../eipIconCatalog"
import { toTitleCase } from "../utils/titleTransform"
import "./nodes.scss"
import { FlowType } from "../schema/compnentSchema"

export const eipNodeKey = "eipNode"

export type EipNodeData = {
  eipName: string
  label: string
  flowType: FlowType
}

// TODO: Limit handles to a single connection
const renderHandles = (flowType: FlowType) => {
  switch (flowType) {
    case FlowType.Source:
      return <Handle type="source" position={Position.Right}></Handle>
    case FlowType.Sink:
      return <Handle type="target" position={Position.Left}></Handle>
    case FlowType.Passthru:
      return (
        <>
          <Handle type="source" position={Position.Right}></Handle>
          <Handle type="target" position={Position.Left}></Handle>
        </>
      )
    default:
      console.warn(`flow type not handled: ${flowType}`)
  }
}

const EIPNode = ({ data }: NodeProps<EipNodeData>) => {
  const handles = renderHandles(data.flowType)

  return (
    <ClickableTile className="eip-node">
      <div>{toTitleCase(data.eipName)}</div>
      <img className="eip-node-image" src={eipIconUrls[data.eipName]} />
      <div>
        <strong>{data.label}</strong>
      </div>
      {handles}
    </ClickableTile>
  )
}

export default EIPNode
