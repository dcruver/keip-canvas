import { Checkbox, Form } from "@carbon/react"
import { EipChildren } from "../../api/eipSchema"
import { useAppActions, useGetChildren } from "../../singletons/store"

interface ChildrenConfigProps {
  nodeId: string
  eipChildren: EipChildren
}

const idPrefix = "child-"
const getUniqueId = (id: string) => `${idPrefix}-${id}`
const getOriginalId = (prefixed: string) =>
  prefixed.substring(idPrefix.length + 1)


// TODO: Handle "choice" indicator, as well as multiple child occurences.
const ChildrenConfigs = ({ nodeId, eipChildren }: ChildrenConfigProps) => {
  const { updateChildConfig } = useAppActions()
  const children = useGetChildren(nodeId)

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      {eipChildren.elements.map((child) => (
        <Checkbox
          key={child.name}
          id={getUniqueId(child.name)}
          labelText={child.name}
          defaultChecked={children.includes(child.name)}
          onChange={(_, { checked, id }) => {
            const originalId = getOriginalId(id)
            const updatedChildren = checked
              ? [...children, originalId]
              : children.filter((c) => c !== originalId)

            updateChildConfig(nodeId, updatedChildren)
          }}
        />
      ))}
    </Form>
  )
}

export default ChildrenConfigs
