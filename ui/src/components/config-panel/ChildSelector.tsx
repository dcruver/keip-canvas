import { Checkbox, Form, RadioButton, RadioButtonGroup } from "@carbon/react"
import { useStoreApi } from "reactflow"
import { EipFlowNode } from "../../api/flow"
import { EipChildGroup } from "../../api/generated/eipComponentDef"
import { EipId } from "../../api/id"
import {
  DYNAMIC_ROUTING_CHILDREN,
  lookupContentBasedRouterKeys,
} from "../../singletons/eipDefinitions"
import { useAppActions, useGetChildren } from "../../singletons/store"

interface ChildrenConfigProps {
  nodeId: string
  childGroup: EipChildGroup
}

interface ChildrenInputProps {
  childrenOptions: string[]
  childrenState: string[]
  updateChildrenState: (updates: string[]) => void
}

const idPrefix = "child-"
const getUniqueId = (id: string) => `${idPrefix}-${id}`
const getName = (id: string) => id.substring(idPrefix.length + 1)

const isCustomDynamicRouterChild = (childName: string, eipId?: EipId) => {
  if (!eipId) {
    return false
  }

  const keyDef = lookupContentBasedRouterKeys(eipId)
  if (!keyDef) {
    return false
  }

  return keyDef.type === "child" && keyDef.name === childName
}

const ChildrenMultiSelection = ({
  childrenOptions,
  childrenState,
  updateChildrenState,
}: ChildrenInputProps) => {
  const handleChange = (checked: boolean, id: string) => {
    const name = getName(id)
    const updatedChildren = checked
      ? [...childrenState, name].sort()
      : childrenState.filter((c) => c !== name)
    updateChildrenState(updatedChildren)
  }

  return childrenOptions.map((name) => (
    <Checkbox
      key={name}
      id={getUniqueId(name)}
      labelText={name}
      defaultChecked={childrenState.includes(name)}
      onChange={(_, { checked, id }) => handleChange(checked, id)}
    />
  ))
}

const ChildrenSingleSelection = ({
  childrenOptions,
  childrenState,
  updateChildrenState,
}: ChildrenInputProps) => {
  if (childrenState?.length > 1) {
    console.warn(
      "Expected a single child element in state array",
      childrenState
    )
  }

  const elements = ["none", ...childrenOptions]
  const handleClick = (name: string) => {
    name === "none" ? updateChildrenState([]) : updateChildrenState([name])
  }

  return (
    <RadioButtonGroup
      name="children"
      orientation="vertical"
      defaultSelected={childrenState?.[0] || "none"}
    >
      {elements.map((name) => (
        <RadioButton
          key={name}
          id={getUniqueId(name)}
          value={name}
          labelText={name}
          onClick={(ev) => handleClick(ev.currentTarget.value)}
        />
      ))}
    </RadioButtonGroup>
  )
}

// TODO: Handle multiple occurences of the same child type.
const ChildSelector = ({ nodeId, childGroup }: ChildrenConfigProps) => {
  const reactFlowStore = useStoreApi()
  const { nodeInternals } = reactFlowStore.getState()

  const { updateEnabledChildren } = useAppActions()
  const childrenState = useGetChildren(nodeId)

  const updateChildrenState = (updates: string[]) =>
    updateEnabledChildren(nodeId, updates)

  const parentNode = nodeInternals.get(nodeId) as EipFlowNode | undefined

  const sortedNames = childGroup.children
    .filter(
      (c) =>
        !DYNAMIC_ROUTING_CHILDREN.has(c.name) &&
        !isCustomDynamicRouterChild(c.name, parentNode?.data.eipId)
    )
    .map((c) => c.name)
    .sort()

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      {childGroup.indicator === "choice" ? (
        <ChildrenSingleSelection
          childrenOptions={sortedNames}
          childrenState={childrenState}
          updateChildrenState={updateChildrenState}
        />
      ) : (
        <ChildrenMultiSelection
          childrenOptions={sortedNames}
          childrenState={childrenState}
          updateChildrenState={updateChildrenState}
        />
      )}
    </Form>
  )
}

export default ChildSelector
