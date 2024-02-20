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
import { EipFlowNode } from "../custom-nodes/EIPNode"
import { Attribute, lookupEipComponent } from "../schema/componentSchema"
import { useAppActions, useGetNode } from "../store"
import AttributeConfigForm from "./AttributeConfig"

type PanelContentProps = {
  nodeId: string
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

const PanelContent = ({ nodeId }: PanelContentProps) => {
  const [showAttributes, setShowAttributes] = useState(true)
  const node = useGetNode(nodeId)
  const { updateNodeLabel } = useAppActions()

  const eipComponent = node ? lookupEipComponent(node.data.eipId) : null

  // TODO: Node should remain highlighted in diagram when panel is open.
  return (
    eipComponent && (
      <Stack gap={8}>
        <Stack gap={6}>
          <TextInput
            id="nodeId"
            labelText="NodeId"
            disabled
            defaultValue={nodeId}
          />
          <TextInput id={"channelId"} labelText="ChannelId" disabled />
          <TextInput
            id="nodeLabel"
            labelText="Label"
            value={node ? node.data.label : ""}
            onChange={(e) => updateNodeLabel(nodeId, e.target.value)}
          />
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
  )
}

const NodeConfigPanel = () => {
  // TODO: Handle case where no attributes are listed or required.
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const selected = nodes.map((node: EipFlowNode) => node.id)
      setSelectedNodeId(selected.length === 1 ? selected[0] : null)
    },
  })

  // TODO: Pass in channelId to PanelContent
  return (
    <HeaderPanel
      className={selectedNodeId ? "right-panel" : ""}
      expanded={Boolean(selectedNodeId)}
    >
      {selectedNodeId ? (
        <PanelContent key={selectedNodeId} nodeId={selectedNodeId} />
      ) : (
        // Returning an empty fragment because the HeaderPanel component spams the logs with error messages if it doesn't have any children.
        <></>
      )}
    </HeaderPanel>
  )
}

export default NodeConfigPanel
