import {
  ContentSwitcher,
  Form,
  HeaderPanel,
  Stack,
  Switch,
  TextArea,
  TextInput,
} from "@carbon/react"
import { useState } from "react"
import { useOnSelectionChange } from "reactflow"
import eipComponentSchema, {
  Attribute,
  EIPComponentSchema,
} from "../schema/compnentSchema"
import AttributeConfigForm from "./AttributeConfig"

type PanelContentProps = {
  nodeId: string
  eipComponent: EIPComponentSchema
}

const flowControlledAttributes = new Set(["id", "channel"])

const getConfigurableAttributes = (attrs: Attribute[]) => {
  return attrs.filter((attr) => !flowControlledAttributes.has(attr.name))
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

const PanelContent = ({ nodeId, eipComponent }: PanelContentProps) => {
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
            attrs={
              eipComponent.attributes
                ? getConfigurableAttributes(eipComponent.attributes)
                : []
            }
          />
        ) : (
          <ChildrenConfigs />
        )}
      </Stack>
    </Stack>
  )
}

const NodeConfigPanel = () => {
  // TODO: Handle case where no attributes are listed or required.
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes.map((node) => node.id))
    },
  })

  const isDisplayed = selectedNodes.length === 1

  return (
    <HeaderPanel
      className={isDisplayed ? "right-panel" : ""}
      expanded={isDisplayed}
    >
      <PanelContent
        // key={selectedNodes[0]}
        nodeId={selectedNodes[0]}
        eipComponent={eipComponentSchema["integration"][0]}
      />
    </HeaderPanel>
  )
}

export default NodeConfigPanel
