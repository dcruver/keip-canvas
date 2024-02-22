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

interface Children {
  indicator: "all" | "choice" | "sequence"
  elements: EipElement[]
}

interface EipElement {
  name: string
  description?: string
  attributes?: Attribute[]
  children?: Children
}

export interface EipComponent extends EipElement {
  role: Role
  flowType: FlowType
}

export type EipSchema = Record<string, EipComponent[]>
