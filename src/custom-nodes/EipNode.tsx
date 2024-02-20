import { ClickableTile } from "@carbon/react"
import { Handle, Node, NodeProps, Position } from "reactflow"

import { EipId } from "../api/eip"
import getIconUrl from "../eipIconCatalog"
import { FlowType, Role } from "../schema/componentSchema"
import { toTitleCase } from "../utils/titleTransform"
import "./nodes.scss"

export const eipNodeKey = "eipNode"

const defaultNamespace = "integration"

export type EipNodeData = {
  eipId: EipId
  label: string
  flowType: FlowType
  role: Role
}

export type EipFlowNode = Node<EipNodeData>

// TODO: Limit handles to the appropriate number of connections
const renderHandles = (flowType: FlowType) => {
  switch (flowType) {
    case "source":
      return <Handle type="source" position={Position.Right}></Handle>
    case "sink":
      return <Handle type="target" position={Position.Left}></Handle>
    case "passthru":
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

const getNamespacedTitle = (eipId: EipId) => {
  if (eipId.namespace === defaultNamespace) {
    return toTitleCase(eipId.name)
  }
  return toTitleCase(eipId.namespace) + " " + toTitleCase(eipId.name)
}

// TODO: Consider separating into Endpoint and Channel custom node types
const EipNode = ({ data }: NodeProps<EipNodeData>) => {
  const handles = renderHandles(data.flowType)

  const roleClassName =
    data.role === "channel" ? "eip-channel-node" : "eip-endpoint-node"
  const clsNames = "eip-node " + roleClassName

  return (
    <ClickableTile className={clsNames}>
      <div>{getNamespacedTitle(data.eipId)}</div>
      <img className="eip-node-image" src={getIconUrl(data.eipId)} />
      <div>
        <strong>{data.label}</strong>
      </div>
      {handles}
    </ClickableTile>
  )
}

export default EipNode
