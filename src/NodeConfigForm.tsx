import { Information } from "@carbon/icons-react"
import {
    ContentSwitcher,
    Form,
    FormLabel,
    Select,
    SelectItem,
    Stack,
    Switch,
    TextArea,
    TextInput,
    Tooltip,
} from "@carbon/react"
import { useState } from "react"
import { AttributeSchema, EIPComponentSchema } from "./compnentSchema"

interface Attribute {
  name: string
  type: "string" | "boolean"
  required: boolean
  description?: string
  default?: string | number
  allowedValues?: string[]
}

type NodeConfigPanelProps = {
  nodeId: string
  eipComponent: EIPComponentSchema
}

type TextInputSubsetProps = {
  hideLabel?: boolean
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

const AttributeSelectInput = (props: Attribute) => (
  <Select id={props.name} labelText={props.name} defaultValue={props.default}>
    {props.allowedValues?.map((item) => (
      <SelectItem key={item} value={item} text={item} />
    ))}
  </Select>
)

const AttributeTextInput = (props: Attribute & TextInputSubsetProps) => (
  <TextInput
    id={props.name}
    labelText={props.name}
    defaultValue={props.default}
    hideLabel={props.hideLabel}
  />
)

const TextInputWithDescription = (props: Attribute) => {
  const tooltipDivId = `tooltip-hack-${props.name}`

  const tooltipWorkaroundHandler: React.MouseEventHandler = (e) => {
    const icon: Element = e.target
    const tooltipParent = document.getElementById(tooltipDivId)

    const tooltip = tooltipParent?.getElementsByClassName(
      "cds--tooltip-content"
    )[0]

    const rect = icon.getBoundingClientRect()
    tooltip.style.left = `${rect.left}px`
    tooltip.style.top = `${rect.top}px`
    tooltip.style.position = "fixed"
  }

  return (
    <div id={tooltipDivId}>
      <FormLabel className="form-input-label">{props.name}</FormLabel>
      <Tooltip align="top" label={props.description}>
        <Information onMouseEnter={tooltipWorkaroundHandler} />
      </Tooltip>
      <AttributeTextInput {...props} hideLabel />
    </div>
  )
}

const AttributeInput = (props: Attribute) => {
  switch (props.type) {
    case "string":
      if (props.allowedValues) {
        return <AttributeSelectInput {...props} />
      }
      return props.description ? (
        <TextInputWithDescription {...props} />
      ) : (
        <AttributeTextInput {...props} />
      )
  }
}

const AttributeConfigs = (props: { attrs: Attribute[] }) => {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Stack gap={6}>
        {props.attrs.map((attr) => (
          <AttributeInput key={attr.name} {...attr} />
        ))}
      </Stack>
    </Form>
  )
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
  // TODO: Handle case where no attributes are required.
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
        <TextInput
          id={"channelId"}
          labelText="channelId"
          disabled
        ></TextInput>
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
          <AttributeConfigs
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
