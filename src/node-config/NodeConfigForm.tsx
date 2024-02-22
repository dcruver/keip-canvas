import {
  Form,
  HeaderPanel,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextArea,
  TextInput,
} from "@carbon/react"
import { useState } from "react"
import { useOnSelectionChange } from "reactflow"
import { EipFlowNode } from "../custom-nodes/EipNode"
import { Attribute, lookupEipComponent } from "../schema/componentSchema"
import { useAppActions, useGetNode } from "../store"
import AttributeConfigForm from "./AttributeConfig"

interface PanelContentProps {
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
  const node = useGetNode(nodeId)
  const { updateNodeLabel } = useAppActions()

  const eipComponent = node ? lookupEipComponent(node.data.eipId) : null

  // TODO: Refactor: extract into smaller components
  return (
    eipComponent && (
      <Stack gap={8}>
        <Stack gap={6} className="side-panel-padded-container">
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
          <Tabs>
            <TabList
              aria-label="Attributes/children toggle"
              contained
              fullWidth
            >
              <Tab>Attributes</Tab>
              <Tab>Children</Tab>
            </TabList>
            <TabPanels>
              <TabPanel className="side-panel-unpadded-container">
                <AttributeConfigForm
                  attrs={
                    eipComponent.attributes
                      ? getConfigurableAttributes(eipComponent.attributes)
                      : []
                  }
                />
              </TabPanel>
              <TabPanel>
                <ChildrenConfigs />
              </TabPanel>
            </TabPanels>
          </Tabs>
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
      className={selectedNodeId ? "node-config-panel" : ""}
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
