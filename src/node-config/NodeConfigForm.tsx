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
import { Node, useOnSelectionChange } from "reactflow"
import { EipNodeData } from "../custom-nodes/EIPNode"
import eipComponentSchema, {
  Attribute,
  EIPComponentSchema,
} from "../schema/compnentSchema"
import AttributeConfigForm from "./AttributeConfig"

type PanelContentProps = {
  nodeId: string
  eipComponent: EIPComponentSchema
}

type SelectedNode = {
  id: string
  eipName: string
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


  // TODO: Allow setting node label from panel
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

// TODO: Use a map
const findComponent = (eipName: string) => {
  for (const c of eipComponentSchema["integration"]) {
    if (c.name === eipName) {
      return c
    }
  }
}

const NodeConfigPanel = () => {
  // TODO: Handle case where no attributes are listed or required.
  const [selectedNodes, setSelectedNodes] = useState<SelectedNode[]>([])

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(
        nodes.map((node: Node<EipNodeData>) => ({
          id: node.id,
          eipName: node.data.eipName,
        }))
      )
    },
  })

  const isDisplayed = selectedNodes.length === 1
  const node = isDisplayed ? selectedNodes[0] : null

  // TODO: Pass in channelId to PanelContent
  return (
    <HeaderPanel
      className={isDisplayed ? "right-panel" : ""}
      expanded={isDisplayed}
    >
      {isDisplayed && (
        <PanelContent
          key={node!.id}
          nodeId={node!.id}
          eipComponent={findComponent(node!.eipName)}
        />
      )}
    </HeaderPanel>
  )
}

export default NodeConfigPanel
