import { Stack, Tile } from "@carbon/react"
import { Handle, NodeProps, Position } from "reactflow"

import { ServiceId } from "@carbon/react/icons"
import { EipId } from "../../api/eipId"
import { FlowType } from "../../api/eipSchema"
import { EipNodeData } from "../../api/flow"
import getIconUrl from "../../singletons/eipIconCatalog"
import { toTitleCase } from "../../utils/titleTransform"
import "./nodes.scss"

const defaultNamespace = "integration"

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

const ChildIcons = () => (
  <Stack className="eip-node-child" orientation="horizontal" gap={2}>
    <div>
      <ServiceId size={16} />
    </div>
    <div>
      <ServiceId size={16} />
    </div>
    <div>
      <ServiceId size={16} />
    </div>
  </Stack>
)

// TODO: Consider separating into Endpoint and Channel custom node types
const EipNode = (props: NodeProps<EipNodeData>) => {
  const { data } = props
  const handles = renderHandles(data.flowType)

  const hasChildren = false

  return (
    <Tile className={getClassNames(props)}>
      <div>{getNamespacedTitle(data.eipId)}</div>
      <img className="eip-node-image" src={getIconUrl(data.eipId)} />
      <div style={hasChildren ? { paddingBottom: "0.5rem" } : {}}>
        <strong>{data.label}</strong>
      </div>
      {hasChildren && <ChildIcons />}
      {handles}
    </Tile>
  )
}

export default EipNode
