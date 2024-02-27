import { Button, Stack, Tile } from "@carbon/react"
import { Handle, NodeProps, Position } from "reactflow"

import { ServiceId } from "@carbon/react/icons"
import { EipId } from "../../api/eipId"
import { FlowType } from "../../api/eipSchema"
import { EipNodeData } from "../../api/flow"
import getIconUrl from "../../singletons/eipIconCatalog"
import { useGetChildren } from "../../singletons/store"
import { toTitleCase } from "../../utils/titleTransform"
import "./nodes.scss"

interface ChildIconsProps {
  childNames: string[]
}

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

// TODO: Account for a large number of children
// TODO: Create a mapping of children to icons (with a fallback option)
const ChildIcons = ({ childNames }: ChildIconsProps) => (
  <Stack className="eip-node-child" orientation="horizontal" gap={2}>
    {childNames.map((name) => (
      <Button
        key={name}
        className="nodrag child-icon-button"
        hasIconOnly
        renderIcon={ServiceId}
        iconDescription={name}
        size="sm"
        tooltipPosition="bottom"
        kind="primary"
      />
    ))}
  </Stack>
)

// TODO: Consider separating into Endpoint and Channel custom node types
const EipNode = (props: NodeProps<EipNodeData>) => {
  const children = useGetChildren(props.id)

  const { data } = props
  const handles = renderHandles(data.flowType)

  return (
    <Tile className={getClassNames(props)}>
      <div>{getNamespacedTitle(data.eipId)}</div>
      <img className="eip-node-image" src={getIconUrl(data.eipId)} />
      <div style={children ? { paddingBottom: "0.5rem" } : {}}>
        <strong>{data.label}</strong>
      </div>
      {children && <ChildIcons childNames={children} />}
      {handles}
    </Tile>
  )
}

export default EipNode
