import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ContainedList,
  ContainedListItem,
  Dropdown,
  Layer,
  Modal,
  Popover,
  PopoverContent,
  Stack,
  Tile,
  TreeNode,
  TreeView,
} from "@carbon/react"
import { Close, ServiceId } from "@carbon/react/icons"
import { ReactNode, useState } from "react"
import { createPortal } from "react-dom"
import { Handle, NodeProps, Position, useNodeId } from "reactflow"
import { EipNodeData, Layout } from "../../api/flow"
import {
  ConnectionType,
  EipComponent,
  EipRole,
} from "../../api/generated/eipComponentDef"
import { EipId } from "../../api/generated/eipFlow"
import { lookupEipComponent } from "../../singletons/eipDefinitions"
import getIconUrl from "../../singletons/eipIconCatalog"
import {
  clearSelectedChildNode,
  disableChild,
  enableChild,
} from "../../singletons/store/appActions"
import {
  useGetEnabledChildren,
  useGetLayout,
} from "../../singletons/store/getterHooks"
import { getEipId } from "../../singletons/store/storeViews"
import { toTitleCase } from "../../utils/titleTransform"
import "./nodes.scss"

interface ChildrenUpdateModalProps {
  open: boolean
  setOpen: (open: boolean) => void
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

const getEipDefinition = (rootEipDef: EipComponent, path: string[]) => {
  let children = rootEipDef.childGroup?.children

  if (path.length == 1) {
    return children
  }

  for (const id of path.slice(1)) {
    const name = getEipId(id)?.name
    const child = children?.find((c) => c.name === name)
    children = child?.childGroup?.children
  }
  return children
}

const ChildrenUpdateModal = ({ open, setOpen }: ChildrenUpdateModalProps) => {
  const rootId = useNodeId()!
  const [path, setPath] = useState([rootId])
  const parentId = path[path.length - 1]
  const enabledChildren = useGetEnabledChildren(parentId)

  const rootEipId = getEipId(rootId)
  const rootEipDef = rootEipId && lookupEipComponent(rootEipId)

  const childOptions = rootEipDef && getEipDefinition(rootEipDef, path)

  let modalContent: ReactNode
  if (childOptions && childOptions.length > 0) {
    modalContent = (
      <>
        <Dropdown
          id={"dropdown-child-selector"}
          label="Select child..."
          items={[null, ...childOptions]}
          itemToString={(child) => child?.name ?? ""}
          onChange={({ selectedItem }) => {
            selectedItem &&
              enableChild(parentId, {
                namespace: DEFAULT_NAMESPACE,
                name: selectedItem.name,
              })
          }}
          selectedItem={null}
          titleText={"Add a child"}
        />

        <Layer>
          <ContainedList
            className="child-update-modal__list"
            label="Children"
            kind="on-page"
          >
            {enabledChildren.map((childId) => {
              const eipId = getEipId(childId)
              return (
                <ContainedListItem
                  key={childId}
                  action={
                    <Button
                      kind="ghost"
                      iconDescription="Delete"
                      hasIconOnly
                      renderIcon={Close}
                      tooltipPosition="left"
                      onClick={() => disableChild(parentId, childId)}
                    />
                  }
                  onClick={() => setPath((path) => [...path, childId])}
                >
                  <span>{eipId?.name}</span> <span>({childId})</span>
                </ContainedListItem>
              )
            })}
          </ContainedList>
        </Layer>
      </>
    )
  } else {
    modalContent = <p>No children defined</p>
  }

  // TODO: Look into using a ComposedModal rather than relying on 'passiveModal' prop
  return createPortal(
    <Modal
      className="child-update-modal"
      open={open}
      onRequestClose={() => setOpen(false)}
      modalHeading="Update Children"
      modalLabel={rootEipDef?.name}
      passiveModal
      size="md"
    >
      <Stack orientation="vertical" gap={4}>
        <Breadcrumb>
          {path.map((id, idx) => (
            <BreadcrumbItem
              key={idx}
              onClick={() => setPath((prev) => prev.slice(0, idx + 1))}
            >
              {getEipId(id)?.name}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
        {modalContent}
      </Stack>
    </Modal>,
    document.body
  )
}

const ChildTree = () => {
  const [modalOpen, setModalOpen] = useState(true)
  return (
    <div>
      <TreeView
        className={"child-tree-view"}
        label={"children-menu"}
        hideLabel
        size="xs"
      >
        <TreeNode
          className={"child-tree-view__node"}
          id={"_add-child-action"}
          label="add child..."
          onSelect={() => modalOpen || setModalOpen(true)}
        />
      </TreeView>
      <ChildrenUpdateModal open={modalOpen} setOpen={setModalOpen} />
    </div>
  )
}

// TODO: Move children popover to a separate file
const ChildrenPopoverMenu = () => {
  const [open, setOpen] = useState(true)

  return (
    <Popover
      className="eip-children-popover"
      highContrast
      open={open}
      onRequestClose={() => setOpen(true)}
      onKeyDown={(ev: React.KeyboardEvent) =>
        ev.key === "Escape" && setOpen(true)
      }
    >
      {/* TODO: Make button smaller */}
      <Button
        className="eip-children-popover__button"
        hasIconOnly
        renderIcon={ServiceId}
        iconDescription="children"
        size="sm"
        tooltipPosition="bottom"
        kind="primary"
        onClick={(ev) => {
          ev.stopPropagation()
          setOpen(!open)
        }}
      />
      <PopoverContent>
        <ChildTree />
      </PopoverContent>
    </Popover>
  )
}

// TODO: Consider separating into Endpoint and Channel custom node types
export const EipNode = (props: NodeProps<EipNodeData>) => {
  // TODO: clearSelectedChildNode is used in too many different components. See if that can be reduced (or elimnated).
  const layout = useGetLayout()
  const children = useGetEnabledChildren(props.id)
  const hasChildren = children.length > 0

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
      {/* TODO: Only show children menu if component has a non-empty child group */}
      <ChildrenPopoverMenu />
      {handles}
    </Tile>
  )
}
