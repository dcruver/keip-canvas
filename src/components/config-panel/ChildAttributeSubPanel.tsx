import { EipId } from "../../api/id"

interface ChildAttributePanelProps {
  parentEipId: EipId
  childName: string
}

const ChildAttributeSubPanel = ({
  parentEipId,
  childName,
}: ChildAttributePanelProps) => (
  <div>{`${parentEipId.namespace}.${parentEipId.name}.${childName}`}</div>
)


export default ChildAttributeSubPanel