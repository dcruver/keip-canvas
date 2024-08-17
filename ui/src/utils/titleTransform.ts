import { DEFAULT_NAMESPACE } from "../api/flow"
import { EipId } from "../api/generated/eipFlow"

export const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ")

export const getNamespacedTitle = (eipId: EipId) => {
  if (eipId.namespace === DEFAULT_NAMESPACE) {
    return toTitleCase(eipId.name)
  }
  return toTitleCase(eipId.namespace) + " " + toTitleCase(eipId.name)
}
