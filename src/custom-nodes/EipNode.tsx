import { Tile } from "@carbon/react"
import { Handle, Node, NodeProps, Position } from "reactflow"

import { EipId } from "../api/eip"
import getIconUrl from "../eipIconCatalog"
import { FlowType, Role } from "../schema/componentSchema"
import { toTitleCase } from "../utils/titleTransform"
import "./nodes.scss"

export const eipNodeKey = "eipNode"

const defaultNamespace = "integration"

export interface EipNodeData {
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
      console.error("unhandled FlowType")
  }
}

const getNamespacedTitle = (eipId: EipId) => {
  if (eipId.namespace === defaultNamespace) {
    return toTitleCase(eipId.name)
  }
  return toTitleCase(eipId.namespace) + " " + toTitleCase(eipId.name)
}

const getClassNames = (props: NodeProps<EipNodeData>) => {
  const roleClsName =
    props.data.role === "channel" ? "eip-channel-node" : "eip-endpoint-node"
  const selectedClsName = props.selected ? "eip-node-selected" : ""
  return ["eip-node", roleClsName, selectedClsName].join(" ")
}

// TODO: Consider separating into Endpoint and Channel custom node types
const EipNode = (props: NodeProps<EipNodeData>) => {
  const { data } = props
  const handles = renderHandles(data.flowType)

  return (
    <Tile className={getClassNames(props)}>
      <div>{getNamespacedTitle(data.eipId)}</div>
      <img className="eip-node-image" src={getIconUrl(data.eipId)} />
      <div>
        <strong>{data.label}</strong>
      </div>
      {handles}
    </Tile>
  )
}

export default EipNode
