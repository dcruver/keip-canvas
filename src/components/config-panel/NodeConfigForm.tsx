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
import { useAppActions, useGetSelectedChildNode } from "../../singletons/store"
import AttributeConfigForm from "./AttributeConfig"
import ChildAttributeSubPanel from "./ChildAttributeSubPanel"
import ChildrenConfigs from "./ChildrenConfig"

interface ConfigurationTabProps {
  nodeId: string
  eipComponent: EipComponent
}

interface PanelContentProps {
  node: EipFlowNode
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
              <ChildrenConfigs
                nodeId={nodeId}
                eipChildren={eipComponent.children}
              />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Stack>
  )
}

const PanelContent = ({ node, eipComponent }: PanelContentProps) => {
  return (
    eipComponent && (
      <Stack gap={8}>
        <NodeIdentifierInputs node={node} />
        <ConfigurationInputTabs nodeId={node.id} eipComponent={eipComponent} />
      </Stack>
    )
  )
}

const NodeConfigPanel = () => {
  const { clearSelectedChildNode } = useAppActions()
  const [selectedNode, setSelectedNode] = useState<EipFlowNode | null>(null)
  const childNodeId = useGetSelectedChildNode()

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      childNodeId && clearSelectedChildNode()
      setSelectedNode(nodes.length === 1 ? nodes[0] : null)
    },
  })

  const eipComponent = selectedNode
    ? lookupEipComponent(selectedNode.data.eipId)
    : null

  let sidePanelContent
  if (childNodeId) {
    sidePanelContent = (
      <ChildAttributeSubPanel
        parentEipId={childNodeId.parentEipId}
        childName={childNodeId.name}
      />
    )
  } else if (selectedNode) {
    // TODO: Pass in channelId to PanelContent
    sidePanelContent = (
      <PanelContent
        key={selectedNode.id}
        node={selectedNode}
        eipComponent={eipComponent!}
      />
    )
  } else {
    // Returning an empty fragment because the HeaderPanel component spams the logs with error messages if it doesn't have any children.
    sidePanelContent = <></>
  }

  const showPanel = Boolean(selectedNode ?? childNodeId)

  return (
    <HeaderPanel
      className={showPanel ? "node-config-panel" : ""}
      expanded={showPanel}
    >
      {sidePanelContent}
    </HeaderPanel>
  )
}

export default NodeConfigPanel
