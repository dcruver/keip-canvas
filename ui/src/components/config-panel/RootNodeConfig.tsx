import { Button, Stack, TextArea, TextInput } from "@carbon/react"
import { ChangeEvent, useMemo, useState } from "react"
import { EipFlowNode } from "../../api/flow"
import { Attribute } from "../../api/generated/eipComponentDef"
import {
  updateNodeDescription,
  updateNodeLabel,
} from "../../singletons/store/appActions"
import { useGetNodeDescription } from "../../singletons/store/getterHooks"
import debounce from "../../utils/debounce"
import { AttributeConfigForm } from "./AttributeConfigForm"
import { ChildManagementModal } from "./ChildManagementModal"
import ConfigurationInputTabs from "./ConfigurationTabs"

interface PanelContentProps {
  node: EipFlowNode
  attributes: Attribute[]
}

const NodeIdentifierInputs = ({ node }: { node: EipFlowNode }) => {
  const description = useGetNodeDescription(node.id)

  const [isLabelValid, setIsLabelValid] = useState(true)

  const handleDescriptionUpdates = useMemo(
    () =>
      debounce(
        (ev: ChangeEvent<HTMLTextAreaElement>) =>
          updateNodeDescription(node.id, ev.target.value),
        300
      ),
    [node.id]
  )

  const handleLabelUpdates = useMemo(
    () =>
      debounce((ev: ChangeEvent<HTMLInputElement>) => {
        const err = updateNodeLabel(node.id, ev.target.value)
        setIsLabelValid(!err)
      }, 300),
    [node.id]
  )

  return (
    <Stack gap={6} className="cfg-panel__container__padding-add">
      <TextInput
        id="nodeId"
        labelText="NodeId"
        disabled
        defaultValue={node.id}
      />
      <TextInput
        id="nodeLabel"
        labelText="Label"
        defaultValue={node ? node.data.label : ""}
        enableCounter
        invalid={!isLabelValid}
        invalidText="Node labels must be unique"
        maxCount={60}
        placeholder="New Node"
        onChange={handleLabelUpdates}
      />
      <TextArea
        labelText="Description"
        helperText="Optional description of the selected node's behavior"
        enableCounter
        maxCount={600}
        defaultValue={description}
        onChange={handleDescriptionUpdates}
      ></TextArea>
    </Stack>
  )
}

const RootNodeConfig = ({ node, attributes }: PanelContentProps) => {
  const [childModalOpen, setChildModalOpen] = useState(false)

  return (
    <Stack gap={8}>
      <NodeIdentifierInputs node={node} />

      {/* Improve styling */}
      <div className="cfg-panel__container__padding-add">
        <Button onClick={() => childModalOpen || setChildModalOpen(true)}>
          Configure Children
        </Button>
      </div>

      <ConfigurationInputTabs
        hasAttributes={attributes.length > 0}
        attributesForm={<AttributeConfigForm id={node.id} attrs={attributes} />}
      />

      <ChildManagementModal
        rootId={node.id}
        open={childModalOpen}
        setOpen={setChildModalOpen}
      />
    </Stack>
  )
}

export default RootNodeConfig
