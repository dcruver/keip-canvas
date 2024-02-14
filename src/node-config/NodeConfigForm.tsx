import {
  ContentSwitcher,
  Form,
  Stack,
  Switch,
  TextArea,
  TextInput,
} from "@carbon/react"
import { useState } from "react"
import { AttributeSchema, EIPComponentSchema } from "../schema/compnentSchema"
import AttributeConfigForm, { Attribute } from "./AttributeConfig"

// TODO:
// - split attribute form into required/optional sections

type NodeConfigPanelProps = {
  nodeId: string
  eipComponent: EIPComponentSchema
}

const attributesFromSchema = (attrs: AttributeSchema[]) => {
  const transformed: Attribute[] = Object.entries(attrs).reduce(
    (accum, [name, fields]) => {
      if (name !== "id" && name !== "channel") {
        accum.push({
          name: name,
          type: fields.type,
          required: Boolean(fields.required),
          description: fields.description,
          default: fields.default,
          allowedValues: fields.restriction?.enum,
        })
      }
      return accum
    },
    [] as Attribute[]
  )
  return transformed
}

const ChildrenConfigs = () => {
  return (
    <Form title="Node configuration" onSubmit={(e) => e.preventDefault()}>
      <Stack gap={6}>
        <TextInput id={"text-input-1"} labelText="Test child"></TextInput>
        <TextInput id={"text-input-2"} labelText="Test child"></TextInput>
      </Stack>
    </Form>
  )
}

const NodeConfigPanel = ({ nodeId, eipComponent }: NodeConfigPanelProps) => {
  // TODO: Handle case where no attributes are listed or required.
  const [showAttributes, setShowAttributes] = useState(true)
  return (
    <Stack gap={8}>
      <Stack gap={6}>
        <TextInput
          id={"nodeId"}
          labelText="nodeId"
          disabled
          defaultValue={nodeId}
        ></TextInput>
        <TextInput id={"channelId"} labelText="channelId" disabled></TextInput>
        <TextArea
          labelText="Description"
          helperText="Optional description of the selected node's behavior"
          enableCounter
          maxCount={600}
        ></TextArea>
      </Stack>
      <Stack gap={6}>
        <ContentSwitcher
          onChange={({ index }) => setShowAttributes(index === 0)}
          size="md"
        >
          <Switch name="attrs" text="Attributes" />
          <Switch name="children" text="Children" />
        </ContentSwitcher>
        {showAttributes ? (
          <AttributeConfigForm
            attrs={attributesFromSchema(eipComponent.attributes)}
          />
        ) : (
          <ChildrenConfigs />
        )}
      </Stack>
    </Stack>
  )
}

export default NodeConfigPanel
