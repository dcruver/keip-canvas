import { Checkbox, Form, RadioButton, RadioButtonGroup } from "@carbon/react"
import { EipChildren, EipElement } from "../../api/eipSchema"
import { useAppActions, useGetChildren } from "../../singletons/store"

interface ChildrenConfigProps {
  nodeId: string
  eipChildren: EipChildren
}

interface ChildrenInputProps {
  childElements: EipElement[]
  childrenState: string[]
  updateChildrenState: (updates: string[]) => void
}

const idPrefix = "child-"
const getUniqueId = (id: string) => `${idPrefix}-${id}`
const getOriginalId = (prefixed: string) =>
  prefixed.substring(idPrefix.length + 1)

const ChildrenMultiSelection = ({
  childElements,
  childrenState,
  updateChildrenState,
}: ChildrenInputProps) => {
  const handleChange = (checked: boolean, id: string) => {
    const originalId = getOriginalId(id)
    const updatedChildren = checked
      ? [...childrenState, originalId]
      : childrenState.filter((c) => c !== originalId)
    updateChildrenState(updatedChildren)
  }

  return childElements.map((child) => (
    <Checkbox
      key={child.name}
      id={getUniqueId(child.name)}
      labelText={child.name}
      defaultChecked={childrenState.includes(child.name)}
      onChange={(_, { checked, id }) => handleChange(checked, id)}
    />
  ))
}

const ChildrenSingleSelection = ({
  childElements,
  childrenState,
  updateChildrenState,
}: ChildrenInputProps) => {
  if (childrenState?.length > 1) {
    console.warn(
      "Expected a single child element in state array",
      childrenState
    )
  }

  const elements = [{ name: "none" }, ...childElements]
  const handleClick = (name: string) => {
    name === "none" ? updateChildrenState([]) : updateChildrenState([name])
  }

  return (
    <RadioButtonGroup
      name="children"
      orientation="vertical"
      defaultSelected={childrenState?.[0] || "none"}
    >
      {elements.map((child) => (
        <RadioButton
          key={child.name}
          id={getUniqueId(child.name)}
          value={child.name}
          labelText={child.name}
          onClick={(ev) => handleClick(ev.currentTarget.value)}
        />
      ))}
    </RadioButtonGroup>
  )
}

// TODO: Handle multiple child occurences.
const ChildrenConfigs = ({ nodeId, eipChildren }: ChildrenConfigProps) => {
  const { updateChildConfig } = useAppActions()
  const childrenState = useGetChildren(nodeId)

  const updateChildrenState = (updates: string[]) =>
    updateChildConfig(nodeId, updates)

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      {eipChildren.indicator === "choice" ? (
        <ChildrenSingleSelection
          childElements={eipChildren.elements}
          childrenState={childrenState}
          updateChildrenState={updateChildrenState}
        />
      ) : (
        <ChildrenMultiSelection
          childElements={eipChildren.elements}
          childrenState={childrenState}
          updateChildrenState={updateChildrenState}
        />
      )}
    </Form>
  )
}

export default ChildrenConfigs
