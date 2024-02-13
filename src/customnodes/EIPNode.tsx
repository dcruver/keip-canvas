import { ClickableTile } from "@carbon/react"
import { Handle, NodeProps, Position } from "reactflow"

import eipImgUrls from "../eipImages"
import { toTitleCase } from "../titleTransform"
import "./nodes.scss"
import { FlowType } from "../compnentSchema"

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
      console.log(`WARNING: flow type not handled: ${flowType}`)
  }
}

const EIPNode = ({ data }: NodeProps<EipNodeData>) => {
  const handles = renderHandles(data.flowType)

  return (
    <ClickableTile className="eip-node">
      <div>{toTitleCase(data.eipName)}</div>
      <img className="eip-node-image" src={eipImgUrls[data.eipName]} />
      <div>
        <strong>{data.label}</strong>
      </div>
      {handles}
    </ClickableTile>
  )
}

export default EIPNode
