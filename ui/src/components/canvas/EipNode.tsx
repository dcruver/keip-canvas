import { Button, Stack, Tile } from "@carbon/react"
import { ServiceId } from "@carbon/react/icons"
import { Handle, NodeProps, Position } from "reactflow"
import { EipNodeData, Layout } from "../../api/flow"
import { ConnectionType, EipRole } from "../../api/generated/eipComponentDef"
import { EipId } from "../../api/generated/eipFlow"
import { lookupEipComponent } from "../../singletons/eipDefinitions"
import getIconUrl from "../../singletons/eipIconCatalog"
import {
  clearSelectedChildNode,
  updateSelectedChildNode,
} from "../../singletons/store/appActions"
import {
  useGetEnabledChildren,
  useGetLayout,
  useGetSelectedChildNode,
} from "../../singletons/store/getterHooks"
import { getEipId } from "../../singletons/store/storeViews"
import { toTitleCase } from "../../utils/titleTransform"
import "./nodes.scss"

interface ChildrenIconsProps {
  childIds: string[]
}

interface ChildIconButtonProps {
  id: string
}

const DEFAULT_NAMESPACE = "integration"
const DEFAULT_NODE_LABEL = "New Node"

const renderHorizontalHandles = (connectionType: ConnectionType) => {
  switch (connectionType) {
    case "source":
      return <Handle id="output" type="source" position={Position.Right} />
    case "sink":
      return <Handle id="input" type="target" position={Position.Left} />
    case "content_based_router":
    case "passthru":
    case "request_reply":
      return (
        <>
          <Handle id="output" type="source" position={Position.Right} />
          <Handle id="input" type="target" position={Position.Left} />
        </>
      )
    case "tee":
      return (
        <>
          <Handle id="output" type="source" position={Position.Right} />
          <Handle id="discard" type="source" position={Position.Bottom} />
          <Handle id="input" type="target" position={Position.Left} />
        </>
      )
  }
}

const renderVerticalHandles = (connectionType: ConnectionType) => {
  switch (connectionType) {
    case "source":
      return <Handle id="output" type="source" position={Position.Bottom} />
    case "sink":
      return <Handle id="input" type="target" position={Position.Top} />
    case "content_based_router":
    case "passthru":
    case "request_reply":
      return (
        <>
          <Handle id="output" type="source" position={Position.Bottom} />
          <Handle id="input" type="target" position={Position.Top} />
        </>
      )
    case "tee":
      return (
        <>
          <Handle id="output" type="source" position={Position.Bottom} />
          <Handle id="discard" type="source" position={Position.Right} />
          <Handle id="input" type="target" position={Position.Top} />
        </>
      )
  }
}

// TODO: Limit handles to the appropriate number of connections
const renderHandles = (
  connectionType: ConnectionType,
  layoutType: Layout["orientation"]
) =>
  layoutType === "horizontal"
    ? renderHorizontalHandles(connectionType)
    : renderVerticalHandles(connectionType)

const getNamespacedTitle = (eipId: EipId) => {
  if (eipId.namespace === DEFAULT_NAMESPACE) {
    return toTitleCase(eipId.name)
  }
  return toTitleCase(eipId.namespace) + " " + toTitleCase(eipId.name)
}

const getClassNames = (props: NodeProps<EipNodeData>, role: EipRole) => {
  const roleClsName =
    role === "channel" ? "eip-channel-node" : "eip-endpoint-node"
  const selectedClsName = props.selected ? "eip-node-selected" : ""
  return ["eip-node", roleClsName, selectedClsName].join(" ")
}

const ChildIconButton = (props: ChildIconButtonProps) => {
  const currSelection = useGetSelectedChildNode()
  const isSelected = currSelection === props.id

  const clsNames = ["child-icon-button"]
  isSelected && clsNames.push("child-icon-button-focused")

  const eipId = getEipId(props.id)

  return eipId ? (
    <Button
      className={clsNames.join(" ")}
      hasIconOnly
      renderIcon={ServiceId}
      iconDescription={eipId.name}
      size="sm"
      tooltipPosition="bottom"
      kind="primary"
      onClick={(ev) => {
        ev.stopPropagation()
        updateSelectedChildNode(props.id)
      }}
    />
  ) : null
}

// TODO: Account for a large number of children to be displayed
// TODO: Create a mapping of children to icons (with a fallback option)
const ChildrenIcons = ({ childIds }: ChildrenIconsProps) => {
  return (
    <Stack className="eip-node-children" orientation="horizontal" gap={2}>
      {childIds.map((id) => (
        <ChildIconButton key={id} id={id} />
      ))}
    </Stack>
  )
}

// TODO: Consider separating into Endpoint and Channel custom node types
export const EipNode = (props: NodeProps<EipNodeData>) => {
  // TODO: clearSelectedChildNode is used in too many different components. See if that can be reduced (or elimnated).
  const layout = useGetLayout()
  const childrenState = useGetEnabledChildren(props.id)
  const hasChildren = childrenState.length > 0

  const eipId = getEipId(props.id)
  const componentDefinition = eipId && lookupEipComponent(eipId)
  if (!componentDefinition) {
    return null
  }

  const handles = renderHandles(
    componentDefinition.connectionType,
    layout.orientation
  )

  const { data } = props

  return (
    <Tile
      className={getClassNames(props, componentDefinition.role)}
      onClick={hasChildren ? () => clearSelectedChildNode() : undefined}
    >
      <div>{getNamespacedTitle(eipId)}</div>
      <img className="eip-node-image" src={getIconUrl(eipId)} />
      <div
        className="eip-node-label"
        style={hasChildren ? { marginBottom: "0.5rem" } : {}}
      >
        <strong>{data.label || DEFAULT_NODE_LABEL}</strong>
      </div>
      {hasChildren && <ChildrenIcons childIds={childrenState} />}
      {handles}
    </Tile>
  )
}
