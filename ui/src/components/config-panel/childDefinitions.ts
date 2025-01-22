import {
    EipChildElement,
    EipComponent,
} from "../../api/generated/eipComponentDef"
import { getEipId } from "../../singletons/store/storeViews"

// Searches the root's child tree to find the child definition referenced by 'childPath'
export const findChildDefinition = (
  rootEipComponent: EipComponent,
  childPath: string[]
) => {
  let children = rootEipComponent.childGroup?.children
  let child: EipChildElement | null = null

  if (childPath.length <= 1) {
    return null
  }

  for (const id of childPath.slice(1)) {
    const name = getEipId(id)?.name
    child = children?.find((c) => c.name === name) ?? null
    children = child?.childGroup?.children
  }

  return child
}
