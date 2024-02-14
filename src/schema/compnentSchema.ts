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

export enum FlowType {
  Source = "source",
  Sink = "sink",
  Passthru = "passthru",
}

export interface EIPComponentSchema {
  name: string
  flowType: FlowType
  description?: string
  attributes?: Attribute[]
}

const eipComponentSchema: Record<string, EIPComponentSchema[]> =
  JSON.parse(schema)

export default eipComponentSchema
