import { Checkbox, Form, RadioButton, RadioButtonGroup } from "@carbon/react"
import { EipChildGroup } from "../../api/generated/eipComponentDef"
import { EipId } from "../../api/id"
import {
  DYNAMIC_ROUTING_CHILDREN,
  lookupContentBasedRouterKeys,
} from "../../singletons/eipDefinitions"
import { disableChild, enableChild } from "../../singletons/store/appActions"
import { useGetEnabledChildren } from "../../singletons/store/getterHooks"
import { getEipId } from "../../singletons/store/storeViews"

interface ChildrenConfigProps {
  nodeId: string
  childGroup: EipChildGroup
}

interface ChildrenInputProps {
  childrenOptions: EipId[]
  childIds: string[]
  parentId: string
}

const idPrefix = "child-"
const getUniqueId = (id: string) => `${idPrefix}-${id}`
const getName = (eipId: EipId | null) => eipId?.name ?? "none"

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
  childIds,
  parentId,
}: ChildrenInputProps) => {
  const enabledChildren = childIds.reduce(
    (acc, curr) => {
      const eipId = getEipId(curr)!
      acc[eipId.name] = curr
      return acc
    },
    {} as Record<string, string>
  )

  const handleChange = (checked: boolean, eipId: EipId) => {
    checked
      ? enableChild(parentId, eipId)
      : disableChild(parentId, enabledChildren[eipId.name])
  }

  return childrenOptions.map((eipId) => (
    <Checkbox
      key={eipId.name}
      id={getUniqueId(eipId.name)}
      labelText={eipId.name}
      defaultChecked={Boolean(enabledChildren[eipId.name])}
      onChange={(_, { checked }) => handleChange(checked, eipId)}
    />
  ))
}

const ChildrenSingleSelection = ({
  childrenOptions,
  childIds,
  parentId,
}: ChildrenInputProps) => {
  if (childIds?.length > 1) {
    console.warn("Expected at most a single enabled child in array", childIds)
  }

  const elements = [null, ...childrenOptions]
  const handleClick = (eipId: EipId | null) => {
    childIds.length > 0 && disableChild(parentId, childIds[0])
    eipId !== null && enableChild(parentId, eipId)
  }

  return (
    <RadioButtonGroup
      name="children"
      orientation="vertical"
      defaultSelected={childIds?.[0] || "none"}
    >
      {elements.map((eipId) => (
        <RadioButton
          key={getName(eipId)}
          id={getUniqueId(getName(eipId))}
          value={getName(eipId)}
          labelText={getName(eipId)}
          onClick={() => handleClick(eipId)}
        />
      ))}
    </RadioButtonGroup>
  )
}

// TODO: Handle multiple occurences of the same child type.
const ChildSelector = ({ nodeId, childGroup }: ChildrenConfigProps) => {
  const childIds = useGetEnabledChildren(nodeId)

  const parentEipId = getEipId(nodeId)

  const sortedNames = childGroup.children
    .filter(
      (c) =>
        !DYNAMIC_ROUTING_CHILDREN.has(c.name) &&
        !isCustomDynamicRouterChild(c.name, parentEipId)
    )
    .map((c) => ({ name: c.name, namespace: parentEipId?.namespace }) as EipId)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      {childGroup.indicator === "choice" ? (
        <ChildrenSingleSelection
          childrenOptions={sortedNames}
          childIds={childIds}
          parentId={nodeId}
        />
      ) : (
        <ChildrenMultiSelection
          childrenOptions={sortedNames}
          childIds={childIds}
          parentId={nodeId}
        />
      )}
    </Form>
  )
}

export default ChildSelector
