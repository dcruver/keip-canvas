type RestrictionType = "enum"

interface Restriction {
  type: RestrictionType
  values?: string[]
}

export type AttributeTypes = string | boolean | number

export interface Attribute {
  name: string
  type: "string" | "boolean" | "number"
  description?: string
  default?: string | number | boolean
  required?: boolean
  restriction?: Restriction
}

export type FlowType = "source" | "sink" | "passthru"

export type Role = "endpoint" | "channel"

interface Occurrence {
  min?: number
  max?: number
}

interface EipElement {
  name: string
  description?: string
  attributes?: Attribute[]
  childGroup?: EipChildGroup
}

export interface EipChildGroup {
  indicator: "all" | "choice" | "sequence"
  children: EipChildElement[]
  occurrence?: Occurrence
}

export interface EipChildElement extends EipElement {
  occurrence?: Occurrence
}

export interface EipComponent extends EipElement {
  role: Role
  flowType: FlowType
}

export type EipSchema = Record<string, EipComponent[]>
