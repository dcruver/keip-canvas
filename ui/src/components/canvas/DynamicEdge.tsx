import { BaseEdge, EdgeProps, getBezierPath } from "reactflow"
import { DynamicEdgeData } from "../../api/flow"

const DynamicEdge = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: EdgeProps<DynamicEdgeData>) => {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return <BaseEdge id={id} path={path} />
}

export default DynamicEdge
