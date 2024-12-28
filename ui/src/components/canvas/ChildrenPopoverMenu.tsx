import {
  Button,
  Popover,
  PopoverContent,
  TreeNode,
  TreeNodeProps,
  TreeView,
} from "@carbon/react"
import { ParentChild } from "@carbon/react/icons"
import { ReactElement, useState } from "react"
import { useNodeId } from "reactflow"
import { updateSelectedChildNode } from "../../singletons/store/appActions"
import {
  getEipId,
  getEnabledChildrenView,
} from "../../singletons/store/storeViews"

const renderTree = (idPath: string[]): ReactElement<TreeNodeProps> => {
  const id = idPath[idPath.length - 1]
  const children = getEnabledChildrenView(id)

  return (
    <TreeNode
      className={"child-tree-view__node"}
      key={id}
      id={id}
      label={getEipId(id)?.name}
      onSelect={() => updateSelectedChildNode(idPath)}
    >
      {children && children.length > 0
        ? children.map((childId) => renderTree([...idPath, childId]))
        : null}
    </TreeNode>
  )
}

const ChildTree = () => {
  const rootId = useNodeId()

  if (!rootId) {
    return null
  }

  return (
    <div>
      <TreeView
        className={"child-tree-view"}
        label={"children-menu"}
        hideLabel
        size="xs"
      >
        {renderTree([rootId]).props.children}
      </TreeView>
    </div>
  )
}

// TODO: Change button location depending on layout
export const ChildrenPopoverMenu = () => {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      className="eip-children-popover"
      highContrast
      open={open}
      onRequestClose={() => setOpen(false)}
      onKeyDown={(ev: React.KeyboardEvent) =>
        ev.key === "Escape" && setOpen(false)
      }
    >
      {/* TODO: Make button smaller. Also, appear onHover if no children. */}
      <Button
        className="eip-children-popover__button"
        hasIconOnly
        iconDescription="children"
        kind="primary"
        renderIcon={ParentChild}
        size="sm"
        tooltipPosition="left"
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
