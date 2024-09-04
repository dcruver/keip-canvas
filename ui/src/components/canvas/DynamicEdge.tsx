import { BaseEdge, EdgeProps, getBezierPath } from "reactflow"
import { DynamicEdgeData } from "../../api/flow"

// TODO: Is a custom edge necessary?
// TODO: Naming?
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
