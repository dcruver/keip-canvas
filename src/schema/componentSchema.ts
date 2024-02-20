import { EipId } from "../api/eip"
import schema from "./json/components.json?raw"

interface Restriction {
  enum?: string[]
}

export interface Attribute {
  name: string
  type: "string" | "boolean"
  description?: string
  default?: string | number | boolean
  required?: boolean
  restriction?: Restriction
}

export type FlowType = "source" | "sink" | "passthru"

export type Role = "endpoint" | "channel"

export interface EipComponent {
  name: string
  role: Role
  flowType: FlowType
  description?: string
  attributes?: Attribute[]
}

type EipSchema = Record<string, EipComponent[]>

export const eipComponentSchema: Readonly<EipSchema> = JSON.parse(schema)

const getFlatMap = (schema: EipSchema) => {
  const map = new Map<string, EipComponent>()
  for (const [namespace, componentList] of Object.entries(schema)) {
    componentList.forEach((c) => map.set(`${namespace}.${c.name}`, c))
  }
  return map
}

const componentFlatMap = getFlatMap(eipComponentSchema)

export const lookupEipComponent = (eipId: EipId) => {
  const component = componentFlatMap.get(`${eipId.namespace}.${eipId.name}`)
  if (component === undefined) {
    console.error(`Did not find component with id: ${eipId}`)
  }
  return component
}
