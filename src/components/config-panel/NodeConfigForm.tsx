import {
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
import { Attribute, EipComponent } from "../../api/eipSchema"
import { EipFlowNode } from "../../api/flow"
import { lookupEipComponent } from "../../singletons/eipDefinitions"
import { useAppActions, useGetNode } from "../../singletons/store"
import AttributeConfigForm from "./AttributeConfig"
import ChildrenConfigs from "./ChildrenConfig"

interface ConfigurationTabProps {
  nodeId: string
  eipComponent: EipComponent
}

const flowControlledAttributes = new Set(["id", "channel"])

const getConfigurableAttributes = (attrs: Attribute[]) => {
  return attrs.filter((attr) => !flowControlledAttributes.has(attr.name))
}

const NodeIdentifierInputs = ({ node }: { node: EipFlowNode }) => {
  const { updateNodeLabel } = useAppActions()
  return (
    <Stack gap={6} className="side-panel-padded-container">
      <TextInput
        id="nodeId"
        labelText="NodeId"
        disabled
        defaultValue={node.id}
      />
      <TextInput id={"channelId"} labelText="ChannelId" disabled />
      <TextInput
        id="nodeLabel"
        labelText="Label"
        value={node ? node.data.label : ""}
        onChange={(e) => updateNodeLabel(node.id, e.target.value)}
      />
      <TextArea
        labelText="Description"
        helperText="Optional description of the selected node's behavior"
        enableCounter
        maxCount={600}
      ></TextArea>
    </Stack>
  )
}

const ConfigurationInputTabs = ({
  nodeId,
  eipComponent,
}: ConfigurationTabProps) => {
  const configurableAttrs = eipComponent.attributes
    ? getConfigurableAttributes(eipComponent.attributes)
    : []

  const hasAttributes = configurableAttrs.length > 0

  return (
    <Stack gap={6}>
      <Tabs>
        <TabList aria-label="Attributes/children toggle" contained fullWidth>
          {hasAttributes && <Tab>Attributes</Tab>}
          {eipComponent.children && <Tab>Children</Tab>}
        </TabList>
        <TabPanels>
          {hasAttributes && (
            <TabPanel className="side-panel-unpadded-container">
              <AttributeConfigForm nodeId={nodeId} attrs={configurableAttrs} />
            </TabPanel>
          )}
          {eipComponent.children && (
            <TabPanel>
              <ChildrenConfigs eipChildren={eipComponent.children} />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Stack>
  )
}

const PanelContent = ({ nodeId }: { nodeId: string }) => {
  const node = useGetNode(nodeId)

  const eipComponent = node ? lookupEipComponent(node.data.eipId) : null

  return (
    eipComponent && (
      <Stack gap={8}>
        <NodeIdentifierInputs node={node!} />
        <ConfigurationInputTabs nodeId={nodeId} eipComponent={eipComponent} />
      </Stack>
    )
  )
}

const NodeConfigPanel = () => {
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
