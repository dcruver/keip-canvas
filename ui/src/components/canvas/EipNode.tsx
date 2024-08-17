import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ContainedList,
  ContainedListItem,
  Modal,
  Popover,
  PopoverContent,
  Tile,
  TreeNode,
  TreeView,
} from "@carbon/react"
import { Add, Close, ServiceId } from "@carbon/react/icons"
import { useContext, useState } from "react"
import { createPortal } from "react-dom"
import { Handle, NodeProps, Position } from "reactflow"
import { EipNodeData, Layout } from "../../api/flow"
import { ConnectionType, EipRole } from "../../api/generated/eipComponentDef"
import { EipId } from "../../api/generated/eipFlow"
import { lookupEipComponent } from "../../singletons/eipDefinitions"
import getIconUrl from "../../singletons/eipIconCatalog"
import {
  useAppActions,
  useGetChildren,
  useGetLayout,
} from "../../singletons/store"
import { toTitleCase } from "../../utils/titleTransform"
import EipComponentContext from "./EipComponentContext"
import "./nodes.scss"

const defaultNamespace = "integration"

const renderHorizontalHandles = (connectionType: ConnectionType) => {
  switch (connectionType) {
    case "source":
      return <Handle id="output" type="source" position={Position.Right} />
    case "sink":
      return <Handle id="input" type="target" position={Position.Left} />
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
  if (eipId.namespace === defaultNamespace) {
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

interface UpdateModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const ChildrenUpdateModal = ({ open, setOpen }: UpdateModalProps) => {
  const rootEipComponent = useContext(EipComponentContext)
  const [path, setPath] = useState([rootEipComponent?.name])

  const [childConfigs, setChildConfigs] = useState<Record<string, string[]>>(
    () =>
      rootEipComponent!.childGroup!.children.reduce(
        (acc, child) => ({
          ...acc,
          [child.name]: [],
        }),
        {}
      )
  )

  return createPortal(
    <Modal
      open={open}
      onRequestClose={() => setOpen(false)}
      modalHeading="Add a new child component"
      modalLabel="Children"
      passiveModal
      size="md"
    >
      <Breadcrumb>
        {path.map((name, idx) => (
          <BreadcrumbItem
            key={idx}
            onClick={() => setPath((prev) => prev.slice(0, idx + 1))}
          >
            {name}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
      {rootEipComponent?.childGroup?.children.map((child) => (
        <ContainedList
          key={child.name}
          label={child.name}
          kind="on-page"
          action={
            <Button
              hasIconOnly
              iconDescription="Add"
              renderIcon={Add}
              tooltipPosition="left"
              onClick={() => {
                const currChildren = childConfigs[child.name]
                const newName =
                  currChildren.length > 0
                    ? `${child.name}${Number(currChildren[currChildren.length - 1].slice(child.name.length)) + 1}`
                    : `${child.name}1`
                setChildConfigs((prev) => ({
                  ...prev,
                  [child.name]: [...prev[child.name], newName],
                }))
              }}
            />
          }
        >
          {childConfigs[child.name]?.map((name) => (
            <ContainedListItem
              key={name}
              onClick={() => setPath((prev) => [...prev, name])}
              action={
                <Button
                  kind="ghost"
                  iconDescription="Dismiss"
                  hasIconOnly
                  renderIcon={Close}
                  tooltipPosition="left"
                  onClick={() =>
                    setChildConfigs((prev) => ({
                      ...prev,
                      [child.name]: prev[child.name].filter((n) => n !== name),
                    }))
                  }
                />
              }
            >
              {name}
            </ContainedListItem>
          ))}
        </ContainedList>
      ))}
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
  const { clearSelectedChildNode } = useAppActions()
  const childrenState = useGetChildren(props.id)
  const hasChildren = childrenState.length > 0

  const { data } = props
  const componentDefinition = lookupEipComponent(data.eipId)!
  const layout = useGetLayout()
  const handles = renderHandles(
    componentDefinition.connectionType,
    layout.orientation
  )

  return (
    <EipComponentContext.Provider value={componentDefinition}>
      <Tile
        className={getClassNames(props, componentDefinition.role)}
        onClick={hasChildren ? () => clearSelectedChildNode() : undefined}
      >
        <div>{getNamespacedTitle(data.eipId)}</div>
        <img className="eip-node-image" src={getIconUrl(data.eipId)} />
        <div
          className="eip-node-label"
          style={hasChildren ? { marginBottom: "0.5rem" } : {}}
        >
          <strong>{data.label}</strong>
        </div>
        {/* TODO: Only show children menu if component has a non-empty child group */}
        <ChildrenPopoverMenu />
        {handles}
      </Tile>
    </EipComponentContext.Provider>
  )
}
