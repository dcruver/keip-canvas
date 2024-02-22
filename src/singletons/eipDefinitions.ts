import { EipId } from "../api/eipId"
import { EipComponent, EipSchema } from "../api/eipSchema"
import schema from "../json/sampleComponents.json?raw"

export const EIP_COMPONENTS: Readonly<EipSchema> = JSON.parse(
  schema
) as EipSchema

const getFlatMap = (schema: EipSchema) => {
  const map = new Map<string, EipComponent>()
  for (const [namespace, componentList] of Object.entries(schema)) {
    componentList.forEach((c) => map.set(`${namespace}.${c.name}`, c))
  }
  return map
}

const componentFlatMap = getFlatMap(EIP_COMPONENTS)

export const lookupEipComponent = (eipId: EipId) => {
  const component = componentFlatMap.get(`${eipId.namespace}.${eipId.name}`)
  if (component === undefined) {
    console.error(`Did not find component with id: ${JSON.stringify(eipId)}`)
  }
  return component
}
