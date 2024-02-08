import { Handle, NodeProps, Position } from "reactflow"

export type ExampleData = {
  label: string
}

const ExampleNode = ({ data }: NodeProps<ExampleData>) => {
  return (
    <>
      <input
        // className="nodrag"
        defaultValue={data.label}
        style={{ textAlign: "center" }}
      />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  )
}

export default ExampleNode
