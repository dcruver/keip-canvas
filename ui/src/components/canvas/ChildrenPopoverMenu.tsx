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
    TreeNode,
    TreeView,
} from "@carbon/react"
import { Close, ServiceId } from "@carbon/react/icons"
import { ReactNode, useState } from "react"
import { createPortal } from "react-dom"
import { useNodeId } from "reactflow"
import { DEFAULT_NAMESPACE } from "../../api/flow"
import { EipComponent } from "../../api/generated/eipComponentDef"
import { lookupEipComponent } from "../../singletons/eipDefinitions"
import { disableChild, enableChild } from "../../singletons/store/appActions"
import { useGetEnabledChildren } from "../../singletons/store/getterHooks"
import { getEipId } from "../../singletons/store/storeViews"

interface ChildrenUpdateModalProps {
  open: boolean
  setOpen: (open: boolean) => void
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

export const ChildrenPopoverMenu = () => {
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
      {/* TODO: Make button smaller. Also, appear onHover if no children. */}
      <Button
        className="eip-children-popover__button"
        hasIconOnly
        renderIcon={ServiceId}
        iconDescription="children"
        size="sm"
        tooltipPosition="bottom"
        kind="primary"
        onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
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
