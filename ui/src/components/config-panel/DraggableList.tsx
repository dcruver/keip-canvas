import { ContainedList, ContainedListItem } from "@carbon/react"

import { Draggable } from "@carbon/react/icons"
import { ContainedListProps } from "@carbon/react/lib/components/ContainedList/ContainedList"
import { Identifier } from "dnd-core"
import { Children, useEffect, useRef, useState } from "react"
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd"

const DragTypes = {
  ROW: "list-row",
}

interface DragItem {
  index: number
  id: string
}

// "ContainedListItem" prop type not exported by Carbon
// See https://react.carbondesignsystem.com/?path=/docs/components-containedlist--overview#component-api
interface DraggableListItemProps {
  id: string
  [key: string]: unknown
}

interface ListItemWrapperProps {
  id: string
  index: number
  move: (dragIdx: number, hoverIdx: number) => void
  onDrop: () => void
  renderListItem: React.ReactNode
}

type DraggableListProps = ContainedListProps & {
  handleDrop?: (ids: string[]) => void
}

interface HoverInput {
  item: DragItem
  monitor: DropTargetMonitor<DragItem, void>
  hoverIdx: number
  move: (dragIdx: number, hoverIdx: number) => void
  ref: React.RefObject<HTMLDivElement>
}

type ListElementsType = React.ReactElement<DraggableListItemProps>[]

const handleHover = ({ item, monitor, hoverIdx, move, ref }: HoverInput) => {
  if (!ref.current) {
    return
  }

  const dragIdx = item.index

  // Don't replace items with themselves
  if (dragIdx === hoverIdx) {
    return
  }

  const hoverBoundingRect = ref.current?.getBoundingClientRect()

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

  // Determine mouse position
  const clientOffset = monitor.getClientOffset()

  // Get pixels to the top
  const hoverClientY = clientOffset!.y - hoverBoundingRect.top

  // Only perform the move when the mouse has crossed half of the items height

  // Dragging downwards
  if (dragIdx < hoverIdx && hoverClientY < hoverMiddleY) {
    return
  }

  // Dragging upwards
  if (dragIdx > hoverIdx && hoverClientY > hoverMiddleY) {
    return
  }

  // Apply the reordering
  move(dragIdx, hoverIdx)

  item.index = hoverIdx
}

const ListItemWrapper = ({
  id,
  index,
  move,
  onDrop,
  renderListItem,
}: ListItemWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: DragTypes.ROW,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    drop: () => onDrop && onDrop(),
    hover: (item: DragItem, monitor) =>
      handleHover({ item, monitor, hoverIdx: index, move, ref }),
  })

  const [{ isDragging }, drag] = useDrag({
    type: DragTypes.ROW,
    item: () => ({
      id,
      index,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  const opacity = isDragging ? 0 : 1
  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      {renderListItem}
    </div>
  )
}

// Drag and drop code adapted from https://react-dnd.github.io/react-dnd/examples/sortable/simple
export const DraggableListItem = (props: DraggableListItemProps) => (
  <ContainedListItem {...props} renderIcon={Draggable} />
)

export const DraggableList = ({ handleDrop, ...props }: DraggableListProps) => {
  const [rows, setRows] = useState(
    () => Children.toArray(props.children) as ListElementsType
  )

  useEffect(
    () => setRows(Children.toArray(props.children) as ListElementsType),
    [props.children]
  )

  const moveRow = (dragIdx: number, hoverIdx: number) =>
    setRows((prev) => {
      const items = [...prev]
      const item = items.splice(dragIdx, 1)[0]
      items.splice(hoverIdx, 0, item)
      return items
    })

  return (
    <ContainedList {...props}>
      {rows.map((row, idx) => (
        <ListItemWrapper
          key={row.props.id}
          id={row.props.id}
          index={idx}
          move={moveRow}
          onDrop={() => handleDrop && handleDrop(rows.map((r) => r.props.id))}
          renderListItem={row}
        ></ListItemWrapper>
      ))}
    </ContainedList>
  )
}
