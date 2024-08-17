import { Stack } from "@carbon/react"
import { Attribute } from "../../api/generated/eipComponentDef"
import { getEipId } from "../../singletons/store/storeViews"
import { toTitleCase } from "../../utils/titleTransform"
import { AttributeConfigForm } from "./AttributeConfigForm"
import ConfigurationInputTabs from "./ConfigurationTabs"

interface ChildAttributePanelProps {
  childId: string
  parentName: string
  attributes: Attribute[]
}

// TODO: Add description for child
const ChildNodeConfig = ({
  childId,
  parentName,
  attributes,
}: ChildAttributePanelProps) => {
  const eipId = getEipId(childId)
  const childName = eipId?.name ?? ""

  return (
    <Stack gap={6}>
      <Stack gap={6} className="cfg-panel__container__padding-add">
        <h4>{toTitleCase(parentName)}</h4>
        <h5>{toTitleCase(childName)}</h5>
      </Stack>
      <ConfigurationInputTabs
        hasAttributes={attributes.length > 0}
        attributesForm={
          <AttributeConfigForm
            id={childId}
            attrs={attributes}
          />
        }
      />
    </Stack>
  )
}

export default ChildNodeConfig
