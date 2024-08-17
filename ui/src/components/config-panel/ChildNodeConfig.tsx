import { Stack } from "@carbon/react"
import { Attribute } from "../../api/generated/eipComponentDef"
import { ChildNodeId } from "../../api/id"
import { toTitleCase } from "../../utils/titleTransform"
import AttributeConfigForm from "./AttributeConfigForm"
import ConfigurationInputTabs from "./ConfigurationTabs"

interface ChildAttributePanelProps {
  childId: ChildNodeId
  parentName: string
  attributes: Attribute[]
}

// TODO: Add description for child
const ChildNodeConfig = ({
  childId,
  parentName,
  attributes,
}: ChildAttributePanelProps) => (
  <Stack gap={6}>
    <Stack gap={6} className="cfg-panel__container__padding-add">
      <h4>{toTitleCase(parentName)}</h4>
      <h5>{toTitleCase(childId.name)}</h5>
    </Stack>
    <ConfigurationInputTabs
      hasAttributes={attributes.length > 0}
      attributesForm={
        <AttributeConfigForm
          id={childId.name}
          parentId={childId.parentNodeId}
          attrs={attributes}
        />
      }
    />
  </Stack>
)

export default ChildNodeConfig
